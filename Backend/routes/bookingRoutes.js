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



// new addition in phase 5 or 6 
const generateInvoice = require("../utils/generateInvoice");
const { Booking, Tour, User } = require("../models/index");

// GET /api/bookings/:id/invoice
// downloads PDF invoice for a confirmed booking
router.get("/:id/invoice", protect, async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Tour, attributes: ["title", "destination", "duration_days"] },
        { model: User, attributes: ["name", "email", "phone"] },
      ],
    });

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    // only booking owner or admin can download
    if (booking.user_id !== req.user.id && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized");
    }

    if (booking.status !== "confirmed") {
      res.status(400);
      throw new Error("Invoice only available for confirmed bookings");
    }

    // set headers so browser downloads it as a PDF file
    const filename = `invoice-booking-${booking.id}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // stream the PDF directly into the response
    generateInvoice(booking, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;