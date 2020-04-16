const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./user');

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
        startLocation: {
            // GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ]
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

tourSchema.pre(/^find/, function (next) {
    // "populate" means when we request it finds each guide by ObjectId located in the 'guides' array
    this.populate({
        path: 'guides',
        // we exclude these props by writing a string starting with minus symbol
        select: '-__v -passwordResetExpires -passwordResetToken',
    });
    next();
});

// tourSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     console.log(guidesPromises)
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })

tourSchema.virtual('durationWeeks').get(function ()  {
    return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
