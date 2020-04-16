const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const handleFactory = require('./handleFactory');


const filterObj = (data, ...args) => {
    const filtered = {};
    Object.keys(data).forEach( el => args.includes(el) ? filtered[el] = data[el] : null )
    return filtered;
}



exports.updateMe = catchAsync(async (req, res, next) => {
    // Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /update-password', 400))
    }
    // Allowed to update only these fields
    const filtered = filterObj(req.body, 'name', 'email');


    await User.updateOne( { _id: req.user.id} , filtered, {runValidators: true});
    const user = await User.findOne({ _id: req.user.id});

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})

exports.removeUser = catchAsync(async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;

    next()
}

exports.getUsers = handleFactory.getAll(User)
exports.getUser = handleFactory.getOne(User);
exports.createUser = handleFactory.createOne(User);
// Do not change the password by this method
exports.editUser = handleFactory.updateOne(User);
exports.deleteUser = handleFactory.deleteOne(User);