const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true
    },
    rating: {
        type: Number,
        default: 10
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    }
});

const User = mongoose.model('User', userSchema)

module.exports = User