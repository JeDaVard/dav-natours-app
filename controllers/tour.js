const Tour = require('../models/tour');
const APIFeatures = require('../utils/apiFeatures')

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next()
}

exports.getTours = async (req, res) => {
    try {
        let features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .fieldLimit()
            .paginate()//Tour.countDocuments())

        let queryTours = await features.query

        const tours = await queryTours;
        res.status(200).json({
            status: 'success',
            result: tours.length,
            data: {
                tours,
            },
        });
    } catch (e) {
        res.status(404).json({
            status: 'fail',
            e: e.errmsg,
        });
    }
};

exports.addNewTour = async (req, res) => {
    const data = req.body;

    try {
        const tour = await Tour.create(data);

        res.status(201).json({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (e) {
        res.status(400).json({
            status: 'fail',
            e: e.errmsg,
        });
    }
};
exports.getTour = async (req, res) => {
    try {
        const _id = req.params.id;
        const tour = await Tour.findOne({ _id });

        res.status(200).json({
            status: 'success',
            data: { tour },
        });
    } catch (e) {
        res.status(404).json({
            status: 'fail',
            e: e.message,
        });
    }
};

exports.editTour = async (req, res) => {
    try {
        const updates = req.body;

        const _id = req.params.id;
        const tour = await Tour.findByIdAndUpdate(_id,  updates);

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch (e) {
        res.status(400).json({
            status: 'fail',
            e: e.errmsg,
        });
    }
};
exports.removeTour = async (req, res) => {
    try {
        const _id = req.params.id;
        await Tour.deleteOne({ _id });

        res.status(200).json({
            status: 'success',
            data: null,
        });
    } catch (e) {
        res.status(400).json({
            status: 'fail',
            e: e.errmsg,
        });
    }
};

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: '$difficulty',
                    numTours: { $sum: 1 },
                    numRating: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: {
                    avgPrice: 1
                }
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
                stats
            }
        })
    } catch (e) {
        res.status(404).json({
            status: 'fail',
            e: e.errmsg
        })
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = +req.params.year;

        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' },
                },

            },
            {
              $addFields: { month: '$_id' }
            },
            {
              $project: {
                  _id: 0
              }
            },
            {
                $sort: { month: 1 }
            },
            {
                $limit: 12
            }
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
    } catch (e) {
        res.status(404).json({
            status: 'fail',
            e: e.errmsg
        })
    }
}