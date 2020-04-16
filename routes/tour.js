const express = require('express');
const tourControllers = require('../controllers/tour');
const authController = require('../controllers/auth');
const reviewRoutes = require('./review');


const router = express.Router();


router.use('/:tourId/reviews', reviewRoutes)

router.route('/top-5-cheapest')
    .get(tourControllers.aliasTopTours, tourControllers.getTours)

router.route('/tour-stats')
    .get(tourControllers.getTourStats);

router.route('/monthly-plan/:year')
    .get(tourControllers.getMonthlyPlan);

router.route('/')
    .get(tourControllers.getTours)
    .post(authController.protect, authController.restrictTo('admin', 'guide'), tourControllers.addNewTour);

router.route('/:id')
    .get(tourControllers.getTour)
    .patch(authController.protect, authController.restrictTo('admin', 'guide'), tourControllers.editTour)
    .delete(authController.protect, authController.restrictTo('admin', 'guide'),tourControllers.removeTour);


module.exports = router