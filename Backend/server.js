const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require("path"); 
require('dotenv').config();

const { connectDB, sequelize } = require('./config/db');
require('./models/index'); // load all models and associations

// route imports
const mapRoutes = require("./routes/mapRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes    = require('./routes/authRoutes');
const tourRoutes    = require('./routes/tourRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes  = require('./routes/reviewRoutes');
const userRoutes    = require('./routes/userRoutes');
const itineraryRoutes = require("./routes/itineraryRoutes");


// error handler
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Global Middleware ─────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static('uploads'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/tours',    tourRoutes);
app.use('/api/bookings', bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use('/api/users',    userRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/maps", mapRoutes);


// nested route — reviews live under tours
// /api/tours/:tourId/reviews
app.use('/api/tours/:tourId/reviews', reviewRoutes);

// health check
app.get('/', (req, res) => {
  res.json({ message: 'Tours & Travel API is running' });
});

// 404 handler — catches any route that doesn't exist
app.use((req, res, next) => {
  res.status(404);
  next(new Error(`Route ${req.originalUrl} not found`));
});

// ── Global Error Handler (must be LAST) ───────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();