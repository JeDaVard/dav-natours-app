const Tour = require('../models/tour');

exports.getTours = async (req, res) => {
    try {
        const tours = await Tour.find();

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
        const updates = req.body

        const _id = req.params.id;
        const tour = await Tour.updateOne({ _id }, updates);
        await tour.save()

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
