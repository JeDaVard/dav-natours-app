const express = require('express');
const bookingController = require('./../controllers/booking');
const authController = require('./../controllers/auth');

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
    .route('/')
    .get(bookingController.getBookings)
    .post(bookingController.addNewBooking);

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.editBooking)
    .delete(bookingController.removeBooking);

module.exports = router;
