const express = require('express');
const userControllers = require('../controllers/user');
const authController = require('../controllers/auth');
const router = express.Router();

router.post('/sign-up', authController.signUp);
router.post('/sign-in', authController.signIn);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/token', authController.resetPassword);

router.patch('/update-password', authController.protect, authController.updatePassword);
router.delete('/deactivate', authController.protect, userControllers.removeUser)

router.route('/users')
    .get(userControllers.getUsers)
    .patch(authController.protect, userControllers.updateUser)

router.route('/users/:id')
    .get(userControllers.getUser)

module.exports = router