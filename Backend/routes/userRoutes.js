const express = require('express');
const { updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// PATCH /api/users/me — update logged-in user's profile
router.patch('/me', protect, updateProfile);

module.exports = router;
