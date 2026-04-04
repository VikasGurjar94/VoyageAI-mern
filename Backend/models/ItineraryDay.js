const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ItineraryDay = sequelize.define(
  "ItineraryDay",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    itinerary_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "itineraries", key: "id" },
    },
    day_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // 1, 2, 3 ... matches the day in the trip
    },
    theme: {
      type: DataTypes.STRING(200),
      allowNull: true,
      // e.g. "Beaches & Water Sports", "Culture & History"
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      // optional — user can set actual trip dates later
    },
    total_day_cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
  },
  {
    tableName: "itinerary_days",
    timestamps: true,
  },
);

module.exports = ItineraryDay;
