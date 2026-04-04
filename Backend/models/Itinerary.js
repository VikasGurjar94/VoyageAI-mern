const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Itinerary = sequelize.define(
  "Itinerary",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    destination: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    days: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    interests: {
      type: DataTypes.JSON, // stored as JSON array ["culture","food","adventure"]
      allowNull: true,
    },
    travel_style: {
      type: DataTypes.ENUM("budget", "comfort", "luxury"),
      defaultValue: "comfort",
    },
    travelers: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM("draft", "saved", "completed"),
      defaultValue: "draft",
    },
    total_estimated_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    ai_generated: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "itineraries",
    timestamps: true,
  },
);

module.exports = Itinerary;
