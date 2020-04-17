const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const handleFactory = require('./handleFactory');


// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

exports.uploadPhoto = upload.single('photo');

const filterObj = (data, ...args) => {
    const filtered = {};
    Object.keys(data).forEach( el => args.includes(el) ? filtered[el] = data[el] : null )
    return filtered;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;

    next()
}
exports.updateMe = catchAsync(async (req, res, next) => {
    // Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /update-password', 400))
    }
    // Allowed to update only these fields
    debugger
    const filtered = filterObj(req.body, 'name', 'email');
    if (req.file) filtered.photo = req.file.filename;

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


exports.getUsers = handleFactory.getAll(User)
exports.getUser = handleFactory.getOne(User);
exports.createUser = handleFactory.createOne(User);
// Do not change the password by this method
exports.editUser = handleFactory.updateOne(User);
exports.deleteUser = handleFactory.deleteOne(User);