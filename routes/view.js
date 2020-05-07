const express = require('express');
const viewsController = require('../controllers/view');
const authController = require('../controllers/auth');
const bookingController = require('../controllers/booking');

const router = express.Router();

router.use(viewsController.alerts);

<<<<<<< HEAD
router.get('/', bookingController.createBookingCheckout, authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.get('/my-tours', authController.protect, viewsController.getMyTours);
=======
router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get(
    '/sign-up',
    authController.isLoggedIn,
    viewsController.getSignUpForm
);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.get(
    '/my-tours',
    // bookingController.webhookCheckout,
    authController.protect,
    viewsController.getMyTours
);
>>>>>>> 3f2c44c94866c3fffd31e6288c26819cd30a5802

router.post(
    '/submit-user-data',
    authController.protect,
    viewsController.updateUserData
);

module.exports = router;
