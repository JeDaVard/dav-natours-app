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
            default: 5,
            min: [1, 'Rating must be 1 or above'],
            max: [5, 'Rating must be 5 or below'],
            set: val => Math.round(val * 10) / 10
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

// For example when we search we receive a result of 3 documents, but mongo actually examine all documents, or let's
//    say more then we need, but when we set an index for a specific field, mongo does less queries
//    that's the theory, well said by Jonas, but I tried and I am guessing this new mongo isn't as stupid as before,
//    or it is smarter than before, I just checked the number of examined docs for 3 result, it was just three.
//    This could be a serious performance gape otherwise, that's why I write so much for future me to check it
//    better for a real world project.
//    Just a remark, after good test series, I realized that (not always, but) in some cases mongo actually does
//    a lot of queries, for ex. 7q. for 1 doc, it's too much. And unfortunately the stuff down here did not help
//    So, future me, hope you resolved this in the future projects.
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({slug: 1});
tourSchema.index({ startLocation: '2dsphere' });

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

// Aggregation middleware
// tourSchema.pre('aggregate', function(next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//
//     next()
// })

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
