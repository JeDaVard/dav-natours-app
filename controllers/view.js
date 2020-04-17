const Tour = require('../models/tour');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find()

    res.status(200).render('overview', {
        title: 'All your tours',
        tours
    })
})

exports.getTour = catchAsync( async (req, res) => {
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    res.status(200).render('tour', {
        title: 'The forest Hiker',
        tour
    })
})