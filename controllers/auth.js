const User = require('../models/user');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email')


const signToken = id => {
    return jwt.sign({ id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signUp = catchAsync(async (req, res, next) => {
    const { name, email, password, passwordConfirm } = req.body;
    const user = await User.create({
        name,
        email,
        password,
        passwordConfirm,
    });

    createSendToken(user, 201, res);
});

exports.signIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(new AppError('Please, provide credentials', 400));

    const user = await User.findOne({ email }).select('+password');
    const isMatch = await user.correctPassword(password, user.password);

    if (!user || !isMatch) return next(new AppError('Incorrect email or password', 400));

    createSendToken(user, 200, res)
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        [, token] = req.headers.authorization.split(' ');
    }

    if (!token) return next(new AppError('You are not logged in!', 401));

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next(new AppError('User does no longer exist', 401))

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('User recently changed password! Please log in again.', 401)
        );
    }

    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403))
        }
        next()
    }
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) return next(new AppError('User not found', 404));

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false })

    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request, copy this and paste to the browser: ${resetURL}`;

    try {
        await sendEmail({
            email,
            subject: 'Password reset [valid for 10m]',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'Token sent to your email, it will be valid for 10 minutes, otherwise you can come back and re-send a new one.'
        })
    } catch (e) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({ validateBeforeSave: false})

        return next(new AppError('There was an error while sending the email. Please, try again.', 500))
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});