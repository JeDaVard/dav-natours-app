const express = require('express');
const tourControllers = require('../controllers/tour');
const router = express.Router();

router.route('/top-5-cheapest')
    .get(tourControllers.aliasTopTours, tourControllers.getTours)

router.route('/')
    .get(tourControllers.getTours)
    .post(tourControllers.addNewTour);

router.route('/:id')
    .get(tourControllers.getTour)
    .patch(tourControllers.editTour)
    .delete(tourControllers.removeTour);

module.exports = router