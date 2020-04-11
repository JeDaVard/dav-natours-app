const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    duration: {
        type: Number,
        required: [true, 'Please, provide the duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size'],
    },
    difficulty: {
        type: String,
        required: [true, 'Please, provide a difficulty level'],
    },
    price: {
        type: Number,
        required: [true, 'Please, provide the price'],
    },
    priceDiscount: Number,
    ratingAverage: {
        type: Number,
        default: 10,
    },
    ratingQuantity: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],

});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
