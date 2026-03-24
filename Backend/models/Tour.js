const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Tour = sequelize.define('Tour', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT, // TEXT = long paragraphs, STRING = short
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2), // 10 digits total, 2 after decimal
    allowNull: false,               // e.g. 12000.00
  },
  duration_days: {
    type: DataTypes.INTEGER,
    allowNull: false, // e.g. 5 (days)
  },
  max_group_size: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'moderate', 'hard'),
    defaultValue: 'easy',
  },
  image: {
    type: DataTypes.STRING(255), // filename of the uploaded image
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // admin can deactivate a tour without deleting
  }
}, {
  tableName: 'tour_packages',
  timestamps: true,
});

module.exports = Tour;