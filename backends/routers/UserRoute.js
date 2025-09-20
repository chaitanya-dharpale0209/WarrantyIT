const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// Create or find user
router.post('/', userController.createOrFindUser);

// Get user by ID
router.get('/:userId', userController.getUser);

module.exports = router;