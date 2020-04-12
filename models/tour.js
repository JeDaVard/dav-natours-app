const mongoose = require('mongoose');
const slugify = require('slugify')

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
        },
        slug: String,
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
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
        ratingsAverage: {
            type: Number,
            default: 10,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        startDates: [Date],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true })
    next()
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
