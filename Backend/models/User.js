const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,  // 1, 2, 3... automatically
    primaryKey: true,     // unique identifier for every row
  },
  name: {
    type: DataTypes.STRING(100), // VARCHAR(100) in MySQL
    allowNull: false,            // NOT NULL — required field
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,   // no two users can share same email
    validate: {
      isEmail: true // sequelize checks it's a valid email format
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    // we'll hash this with bcrypt before saving — never plain text
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'), // only these 2 values allowed
    defaultValue: 'user',                  // new signups = regular user
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true, // optional field
  },
  avatar: {
    type: DataTypes.STRING(255), // stores image filename
    allowNull: true,
  }
}, {
  tableName: 'users',    // exact MySQL table name
  timestamps: true,      // auto adds createdAt and updatedAt columns
});

module.exports = User;