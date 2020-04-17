const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please, provide your name'],
    },
    email: {
        type: String,
        required: [true, 'Please, provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please, provide a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please, write a password'],
        minlength: 6,
        select: false,
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'admin'],
        default: 'user',
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please, confirm your password'],
        // This only works on CREATE and SAVE
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Password are not the same!',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function (next) {
    // Only run this function if password was modified
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next()
})

userSchema.methods.correctPassword = async function (password, dbPassword) {
    return await bcrypt.compare(password, dbPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};


userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;


    return resetToken
};

userSchema.pre(/^find/, function(next) {
    this.find({ active: {$ne: false} })
    next()
})

const User = mongoose.model('User', userSchema);

module.exports = User;
