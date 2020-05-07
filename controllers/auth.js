const User = require('../models/user');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const Email = require('../utils/email')


const signToken = id => {
    return jwt.sign({ id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
<<<<<<< HEAD
    // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
        //the same as
        secure: req.secure || req.headers('x-forwarded-proto') === 'https'
=======
        secure: process.env.NODE_ENV === 'production'
        //the same as
        // secure: req.secure || req.headers('x-forwarded-proto') === 'https'
>>>>>>> 3f2c44c94866c3fffd31e6288c26819cd30a5802
    }

    res.cookie('token', token, cookieOptions)


    // hide password from the output
    user.password = undefined;

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

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(user, url).sendWelcome();


    createSendToken(user, 201, req, res);
});

exports.signIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(new AppError('Please, provide credentials', 400));

    const user = await User.findOne({ email }).select('+password');
    if (!user) return next(new AppError(`There is no account associated with: ${email}`, 400));

    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) return next(new AppError('Incorrect password', 400));

    createSendToken(user, 200, req, res)


});

exports.logout = (req, res) => {
    res.cookie('token', 'loggedOut(dummyText)', {
        expires: new Date(Date.now() + 10 * 1000),
<<<<<<< HEAD
        // httpOnly: true
=======
        httpOnly: true
>>>>>>> 3f2c44c94866c3fffd31e6288c26819cd30a5802
    });
    res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        [, token] = req.headers.authorization.split(' ');
    } else if (req.cookies.token) {
        token = req.cookies.token;
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
    res.locals.user = currentUser
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

    try {
        const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

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
    createSendToken(user, 200, req, res);
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

    // 4) Log user in, send JWT after password changed
    createSendToken(user, 200, req, res);
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.token) {
        try {
            // 1) verify token
            const decoded = await promisify(jwt.verify)(
                req.cookies.token,
                process.env.JWT_SECRET
            );

            // 2) Check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            // 3) Check if user changed password after the token was issued
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};