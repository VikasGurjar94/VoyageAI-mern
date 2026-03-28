const Razorpay = require("razorpay");
const crypto = require("crypto");
const { Booking, Tour, User, Payment } = require("../models/index");
const sendEmail = require("../utils/sendEmail");

// initialize Razorpay with your keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── CREATE RAZORPAY ORDER ────────────────────────────────────
// POST /api/payments/create-order
// called when user clicks "Pay Now"
const createOrder = async (req, res, next) => {
  try {
    const { booking_id } = req.body;

    // fetch the booking to get the amount
    const booking = await Booking.findByPk(booking_id, {
      include: [{ model: Tour }],
    });

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    // only the booking owner can pay
    if (booking.user_id !== req.user.id) {
      res.status(403);
      throw new Error("Not authorized");
    }

    if (booking.status !== "pending") {
      res.status(400);
      throw new Error("This booking is not pending payment");
    }

    // Razorpay requires amount in PAISE (1 rupee = 100 paise)
    const amountInPaise = Math.round(parseFloat(booking.total_price) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `booking_${booking_id}`,
      notes: {
        booking_id: booking_id,
        user_id: req.user.id,
      },
    });

    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      booking_id: booking_id,
      // send key_id to frontend — never send key_secret
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// ── VERIFY PAYMENT ───────────────────────────────────────────
// POST /api/payments/verify
// called after Razorpay checkout succeeds on frontend
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id,
    } = req.body;

    // ── Signature verification ─────────────────────────────
    // Razorpay signs: order_id + "|" + payment_id
    // using your key_secret as the HMAC key
    // if the signature matches — payment is genuine
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      res.status(400);
      throw new Error("Payment verification failed — invalid signature");
    }

    // ── Payment is genuine — update records ────────────────
    const booking = await Booking.findByPk(booking_id, {
      include: [
        { model: Tour, attributes: ["title", "destination", "duration_days"] },
        { model: User, attributes: ["name", "email"] },
      ],
    });

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    // 1. update booking status to confirmed
    await booking.update({ status: "confirmed" });

    // 2. create payment record in DB
    await Payment.create({
      booking_id: booking_id,
      amount: booking.total_price,
      method: "card",
      status: "paid",
      transaction_id: razorpay_payment_id,
      paid_at: new Date(),
    });

    // 3. send confirmation email
    await sendEmail(booking.User.email, "bookingConfirmed", {
      customerName: booking.User.name,
      bookingId: booking.id,
      tourTitle: booking.Tour.title,
      destination: booking.Tour.destination,
      travelDate: new Date(booking.travel_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      numPeople: booking.num_people,
      totalPrice: Number(booking.total_price).toLocaleString("en-IN"),
    });

    res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, verifyPayment };
