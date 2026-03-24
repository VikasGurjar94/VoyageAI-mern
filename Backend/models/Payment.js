const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'bookings', key: 'id' }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  method: {
    type: DataTypes.ENUM('card', 'upi', 'netbanking', 'cash'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'),
    defaultValue: 'pending',
  },
  transaction_id: {
    type: DataTypes.STRING(255), // ID from payment gateway (Razorpay etc.)
    allowNull: true,
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true, // null until actually paid
  }
}, {
  tableName: 'payments',
  timestamps: true,
});

module.exports = Payment;