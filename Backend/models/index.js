const User = require("./User");
const Tour = require("./Tour");
const Booking = require("./Booking");
const Payment = require("./Payment");
const Review = require("./Review");
const Itinerary = require("./Itinerary");
const ItineraryDay = require("./ItineraryDay");
const ItineraryActivity = require("./ItineraryActivity");
const Expense = require("./Expense");


// ── existing associations (keep these) ───────────────────────
User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

Tour.hasMany(Booking, { foreignKey: "tour_id" });
Booking.belongsTo(Tour, { foreignKey: "tour_id" });

Booking.hasOne(Payment, { foreignKey: "booking_id" });
Payment.belongsTo(Booking, { foreignKey: "booking_id" });

Tour.hasMany(Review, { foreignKey: "tour_id" });
Review.belongsTo(Tour, { foreignKey: "tour_id" });

User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(User, { foreignKey: "user_id" });

// -- expense
User.hasMany(Expense, { foreignKey: "user_id" });
Expense.belongsTo(User, { foreignKey: "user_id" });

// ── new itinerary associations ────────────────────────────────

// a user can have many itineraries
User.hasMany(Itinerary, { foreignKey: "user_id" });
Itinerary.belongsTo(User, { foreignKey: "user_id" });

// an itinerary has many days — delete days when itinerary deleted
Itinerary.hasMany(ItineraryDay, {
  foreignKey: "itinerary_id",
  onDelete: "CASCADE",
  hooks: true,
});
ItineraryDay.belongsTo(Itinerary, { foreignKey: "itinerary_id" });

Itinerary.hasMany(Expense, {
  foreignKey: "itinerary_id",
  onDelete: "CASCADE",
  hooks: true,
});
Expense.belongsTo(Itinerary, { foreignKey: "itinerary_id" });

// a day has many activities — delete activities when day deleted
ItineraryDay.hasMany(ItineraryActivity, {
  foreignKey: "day_id",
  onDelete: "CASCADE",
  hooks: true,
});
ItineraryActivity.belongsTo(ItineraryDay, { foreignKey: "day_id" });

module.exports = {
  User,
  Tour,
  Booking,
  Payment,
  Review,
  Itinerary,
  ItineraryDay,
  ItineraryActivity,
  Expense,
};
