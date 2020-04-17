const express = require('express');
const bookingControllers = require('../controllers/booking');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/checkout-session/:tourId', authController.protect, bookingControllers.getCheckoutSession)

module.exports = router