const sendEmail = require("../utils/sendEmail");
const { Booking, Tour, User, Payment } = require("../models/index");

// ─── CREATE BOOKING ────────────────────────────────────────
// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { tour_id, travel_date, num_people, special_requests } = req.body;

    // 1. check tour exists and is active
    const tour = await Tour.findOne({
      where: { id: tour_id, is_active: true },
    });
    if (!tour) {
      res.status(404);
      throw new Error("Tour not found or no longer available");
    }

    // 2. check group size limit
    if (num_people > tour.max_group_size) {
      res.status(400);
      throw new Error(
        `This tour allows max ${tour.max_group_size} people per booking`,
      );
    }

    // 3. calculate total price
    const total_price = tour.price * num_people;

    // 4. create booking — user_id comes from req.user (protect middleware)
    const booking = await Booking.create({
      user_id: req.user.id,
      tour_id,
      travel_date,
      num_people,
      total_price,
      special_requests,
      status: "pending",
    });

    // 5. return booking with tour details
    const fullBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: Tour, attributes: ["title", "destination", "image"] },
        { model: User, attributes: ["name", "email"] },
      ],
    });

    res.status(201).json({ success: true, booking: fullBooking });
  } catch (error) {
    next(error);
  }
};

// ─── GET MY BOOKINGS ────────────────────────────────────────
// GET /api/bookings/my-bookings
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id }, // only THIS user's bookings
      include: [
        {
          model: Tour,
          attributes: ["title", "destination", "image", "duration_days"],
        },
        { model: Payment, attributes: ["status", "method", "paid_at"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL BOOKINGS ────────────────────────────────────────
// GET /api/bookings  (admin only)
const getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ["name", "email", "phone"] },
        { model: Tour, attributes: ["title", "destination"] },
        { model: Payment, attributes: ["status", "amount"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      total: count,
      pages: Math.ceil(count / limit),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE BOOKING ──────────────────────────────────────
// GET /api/bookings/:id
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Tour },
        { model: User, attributes: ["name", "email", "phone"] },
        { model: Payment },
      ],
    });

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    // user can only see their own booking — admin can see any
    if (booking.user_id !== req.user.id && req.user.role !== "admin") {
      res.status(403);
      throw new Error("You are not authorized to view this booking");
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE BOOKING STATUS ───────────────────────────────────
// PATCH /api/bookings/:id/status  (admin only)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "cancelled" , "completed"];

    if (!allowed.includes(status)) {
      res.status(400);
      throw new Error(`Status must be one of: ${allowed.join(", ")}`);
    }

    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    await booking.update({ status });

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// ─── CANCEL BOOKING ──────────────────────────────────────────
// PATCH /api/bookings/:id/cancel  (user cancels their own)
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    // only the booking owner can cancel
    if (booking.user_id !== req.user.id) {
      res.status(403);
      throw new Error("Not authorized to cancel this booking");
    }

    if (booking.status === "cancelled") {
      res.status(400);
      throw new Error("Booking is already cancelled");
    }

    await booking.update({ status: "cancelled" });

    // send cancellation email
    await sendEmail(booking.User.email, "bookingCancelled", {
      customerName: booking.User.name,
      bookingId: booking.id,
      tourTitle: booking.Tour.title,
    });

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
};
