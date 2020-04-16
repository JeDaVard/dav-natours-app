const express = require('express');
const reviewController = require('../controllers/review');
const authController = require('../controllers/auth');

const router = express.Router({ mergeParams: true });


router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(reviewController.setToursUserIds, reviewController.createReview);

router.route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin') ,reviewController.editReview)
    .delete(authController.restrictTo('user', 'admin') ,reviewController.removeReview);


module.exports = router;
