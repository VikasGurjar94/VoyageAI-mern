const express = require('express');
const { body } = require('express-validator');
const {
  createBooking, getMyBookings, getAllBookings,
  getBooking, updateBookingStatus, cancelBooking,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// All booking routes require login
router.use(protect);

// User routes
router.post(
  '/',
  [
    body('tour_id').isInt().withMessage('Valid tour ID is required'),
    body('travel_date').isDate().withMessage('Valid travel date is required'),
    body('num_people')
      .isInt({ min: 1 })
      .withMessage('At least 1 person required'),
  ],
  validate,
  createBooking
);

router.get('/my-bookings', getMyBookings);
router.get('/:id', getBooking);
router.patch('/:id/cancel', cancelBooking);

// Admin routes
router.get('/', adminOnly, getAllBookings);
router.patch('/:id/status', adminOnly, updateBookingStatus);

module.exports = router;