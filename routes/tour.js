const express = require('express');
const tourControllers = require('../controllers/tour');
const router = express.Router();
const authController = require('../controllers/auth')

router.route('/top-5-cheapest')
    .get(tourControllers.aliasTopTours, tourControllers.getTours)

router.route('/tour-stats')
    .get(tourControllers.getTourStats);

router.route('/monthly-plan/:year')
    .get(tourControllers.getMonthlyPlan);

router.route('/')
    .get(authController.protect, tourControllers.getTours)
    .post(tourControllers.addNewTour);

router.route('/:id')
    .get(tourControllers.getTour)
    .patch(tourControllers.editTour)
    .delete(authController.protect, authController.restrictTo('admin', 'guide'),tourControllers.removeTour);

module.exports = router