const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ItineraryActivity = sequelize.define(
  "ItineraryActivity",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    day_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "itinerary_days", key: "id" },
    },
    time: {
      type: DataTypes.STRING(20),
      allowNull: false,
      // e.g. "09:00 AM", "02:30 PM"
    },
    activity: {
      type: DataTypes.STRING(200),
      allowNull: false,
      // e.g. "Visit Aguada Fort"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        "sightseeing",
        "food",
        "adventure",
        "transport",
        "accommodation",
        "shopping",
        "relaxation",
        "culture",
      ),
      defaultValue: "sightseeing",
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
      // place name for map integration later
    },
    estimated_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tips: {
      type: DataTypes.TEXT,
      allowNull: true,
      // AI-generated tips like "Go early to avoid crowds"
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      // controls display order within a day
    },
  },
  {
    tableName: "itinerary_activities",
    timestamps: true,
  },
);

module.exports = ItineraryActivity;
