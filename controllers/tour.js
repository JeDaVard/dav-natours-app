const Tour = require('../models/tour');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getTours = catchAsync(async (req, res, next) => {
    let features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .fieldLimit()
        .paginate(); //Tour.countDocuments())

    let queryTours = await features.query;

    const tours = await queryTours;
    res.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            tours,
        },
    });
});

exports.addNewTour = catchAsync(async (req, res, next) => {
    const data = req.body;

    const tour = await Tour.create(data);

    res.status(201).json({
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const _id = req.params.id;
    const tour = await Tour.findOne({ _id });

    if (!tour) return next(new AppError('Not found that id', 404));

    res.status(200).json({
        status: 'success',
        data: { tour },
    });
});

exports.editTour = catchAsync(async (req, res, next) => {
    const updates = req.body;

    const _id = req.params.id;
    const tour = await Tour.findByIdAndUpdate(_id, updates);

    if (!tour) return next(new AppError('Not found that id', 404));

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.removeTour = catchAsync(async (req, res, next) => {
    const _id = req.params.id;
    const tour = await Tour.deleteOne({ _id });

    if (!tour) return next(new AppError('Not found that id', 404));

    res.status(200).json({
        status: 'success',
        data: null,
    });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                numRating: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: {
                avgPrice: 1,
            },
        },
        // {
        //     $match: {
        //         _id: { $ne: 'easy'}
        //     }
        // }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = +req.params.year;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: { month: 1 },
        },
        {
            $limit: 12,
        },
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan,
        },
    });
});
