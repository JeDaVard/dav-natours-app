const express = require('express');
const userControllers = require('../controllers/user');
const authController = require('../controllers/auth');
const reviewController = require('../controllers/review');
const router = express.Router();

router.post('/sign-up', authController.signUp);
router.post('/sign-in', authController.signIn);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/token', authController.resetPassword);

// all routes are protected after this middleware
router.use(authController.protect)

router.route('/me').get( userControllers.getMe ,userControllers.getUser);
router.patch('/update-password', authController.updatePassword);
router.delete('/deactivate', userControllers.removeUser);
router.patch('/edit', userControllers.updateMe);

// all routes are restricted to admin after this middleware
router.use(authController.restrictTo('admin'));

router.route('/users')
    .get(userControllers.getUsers)
    .post(userControllers.createUser);

router.route('/users/:id')
    .get(userControllers.getUser)
    .patch(userControllers.editUser)
    .delete(userControllers.deleteUser);

module.exports = router;
