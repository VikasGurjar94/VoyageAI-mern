const User     = require('./User');
const Tour     = require('./Tour');
const Booking  = require('./Booking');
const Payment  = require('./Payment');
const Review   = require('./Review');

// A user can make many bookings
User.hasMany(Booking, { foreignKey: 'user_id' });
Booking.belongsTo(User, { foreignKey: 'user_id' });

// A tour can have many bookings
Tour.hasMany(Booking, { foreignKey: 'tour_id' });
Booking.belongsTo(Tour, { foreignKey: 'tour_id' });

// A booking has one payment
Booking.hasOne(Payment, { foreignKey: 'booking_id' });
Payment.belongsTo(Booking, { foreignKey: 'booking_id' });

// A tour can have many reviews
Tour.hasMany(Review, { foreignKey: 'tour_id' });
Review.belongsTo(Tour, { foreignKey: 'tour_id' });

// A user can write many reviews
User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { User, Tour, Booking, Payment, Review };