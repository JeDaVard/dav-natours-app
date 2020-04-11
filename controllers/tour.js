const Tour = require('../models/tour');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';
    next()
}

exports.getTours = async (req, res) => {
    try {
        // Filtering by an exact value
        const queryObj = { ...req.query };
        const fields = [
            'duration',
            'difficulty',
            'maxGroupSize',
            'price',
            'ratingAverage',
            'startDates',
        ];
        for (let prop in req.query) {
            if (!fields.includes(prop)) delete queryObj[prop];
        }

        // Filtering by gte, lte, lt, gt powered by MongoDB
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );

        // Sorting
        let queryTours = Tour.find(JSON.parse(queryStr));

        if (req.query.sort){
            queryTours = queryTours.sort(req.query.sort.split(',').join(' '));
        } else {
            queryTours = queryTours.sort('-createdAt');
        }

        // Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            queryTours = queryTours.select(fields);
        } else {
            queryTours = queryTours.select('-__v');
        }

        // Pagination
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 4;
        let skip = (limit-1) * page

        if (req.query.page) {
            const allTours = await Tour.countDocuments();
            if (skip >= allTours) {
                skip = allTours - limit
            }
        }

        queryTours = queryTours.skip(skip).limit(limit);

        // Execute query
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
            e: e.errmsg,
        });
    }
};

exports.editTour = async (req, res) => {
    try {
        const updates = req.body;

        const _id = req.params.id;
        const tour = await Tour.updateOne({ _id }, updates);
        await tour.save();

        res.status(200).json({
            status: 'success',
            data: { tour },
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
