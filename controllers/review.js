const Review = require('../models/review');
const handleFactory = require('./handleFactory')


exports.setToursUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.author) req.body.author = req.user.id;
    next()
};

exports.getAllReviews = handleFactory.getAll(Review);
exports.getReview = handleFactory.getOne(Review);
exports.createReview = handleFactory.createOne(Review);
exports.editReview = handleFactory.updateOne(Review);
exports.removeReview = handleFactory.deleteOne(Review);

