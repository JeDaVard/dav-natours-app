const express = require('express');
const tourControllers = require('../controllers/tour');
const router = express.Router();

router.param('id', tourControllers.checkID)

router.route('/')
    .get(tourControllers.getTours)
    .post(tourControllers.checkBody, tourControllers.addNewTour);

router.route('/:id')
    .get(tourControllers.getTour)
    .patch(tourControllers.editTour)
    .delete(tourControllers.removeTour);

module.exports = router