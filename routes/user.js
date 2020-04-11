const express = require('express');
const userControllers = require('../controllers/user');
const router = express.Router();

router.param('id', userControllers.checkID)

router.route('/')
    .get(userControllers.getUsers)
    .post(userControllers.createUser);

router.route('/:id')
    .get(userControllers.getUser)
    .patch(userControllers.updateUser)
    .delete(userControllers.removeUser);

module.exports = router