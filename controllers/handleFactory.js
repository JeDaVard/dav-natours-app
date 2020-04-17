const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');


exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const _id = req.params.id;
    const doc = await Model.findByIdAndDelete(_id);

    if (!doc) return next(new AppError('Not found that id', 404));

    res.status(200).json({
        status: 'success',
        data: null,
    });
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const updates = req.body;

    const _id = req.params.id;
    const doc = await Model.findByIdAndUpdate(_id, updates, {new: true});

    if (!doc) return next(new AppError('Not found that id', 404));

    res.status(200).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
})

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const data = req.body;

    const doc = await Model.create(data);

    res.status(201).json({
        status: 'success',
        data: {
            data: doc,
        },
    });
});

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    const _id = req.params.id;
    let query = Model.findOne({ _id });

    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;
    if (!doc) return next(new AppError('Not found that id', 404));

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        },
    });
})

exports.getAll = Model => catchAsync(async (req, res, next) => {

    // To allow for nested get reviews (a small hack :)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    let features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .fieldLimit()
        .paginate(); //Tour.countDocuments())


    let doc = await features.query;

    res.status(200).json({
        status: 'success',
        result: doc.length,
        data: {
            data: doc,
        },
    });
})