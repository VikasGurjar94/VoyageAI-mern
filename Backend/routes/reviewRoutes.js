const express = require('express');
const { body } = require('express-validator');
const { createReview, getTourReviews, deleteReview } = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// mergeParams lets us access :tourId from the parent router
const router = express.Router({ mergeParams: true });

router.get('/', getTourReviews);

router.post(
  '/',
  protect,
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim(),
  ],
  validate,
  createReview
);

router.delete('/:id', protect, deleteReview);

module.exports = router;