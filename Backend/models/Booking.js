const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Foreign keys — link to other tables
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // references the users table
      key: 'id'
    }
  },
  tour_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tour_packages',
      key: 'id'
    }
  },
  travel_date: {
    type: DataTypes.DATEONLY, // stores only date, not time (2024-01-10)
    allowNull: false,
  },
  num_people: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    // = tour.price × num_people (calculated before saving)
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
    defaultValue: 'pending',
  },
  special_requests: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'bookings',
  timestamps: true,
});

module.exports = Booking;