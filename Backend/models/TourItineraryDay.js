const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

// This is NOT the AI itinerary — this is the official
// tour day plan written by the admin for each tour package
const TourItineraryDay = sequelize.define(
  "TourItineraryDay",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tour_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "tour_packages", key: "id" },
    },
    day_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // 1, 2, 3... maps to Day 1, Day 2, Day 3
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      // e.g. "Arrival & Beaches"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      // full day description paragraph
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
      // main location for this day — used for map pin
      // e.g. "Calangute Beach, Goa"
    },
    activities: {
      type: DataTypes.JSON,
      allowNull: true,
      // array of activity strings
      // e.g. ["Morning beach walk", "Snorkeling", "Sunset cruise"]
    },
    meals: {
      type: DataTypes.JSON,
      allowNull: true,
      // e.g. { breakfast: true, lunch: false, dinner: true }
    },
    accommodation: {
      type: DataTypes.STRING(200),
      allowNull: true,
      // e.g. "3-star beach resort"
    },
    distance_km: {
      type: DataTypes.DECIMAL(6, 1),
      allowNull: true,
      defaultValue: 0,
      // km covered this day
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      // optional day-specific image
    },
  },
  {
    tableName: "tour_itinerary_days",
    timestamps: true,
    // each tour can only have one entry per day number
    indexes: [
      {
        unique: true,
        fields: ["tour_id", "day_number"],
      },
    ],
  },
);

module.exports = TourItineraryDay;
