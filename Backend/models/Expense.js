const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Expense = sequelize.define(
  "Expense",
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      // e.g. "Lunch at beach shack", "Taxi to airport"
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        "food",
        "transport",
        "accommodation",
        "sightseeing",
        "shopping",
        "adventure",
        "medical",
        "other",
      ),
      defaultValue: "other",
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      // which day of the trip this expense happened
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "card", "upi", "other"),
      defaultValue: "cash",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // is this expense imported from the AI itinerary plan (planned cost)
    // or was it added manually by user (actual spend)?
    is_planned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      // false = actual spend the user entered
      // true  = imported from AI itinerary estimated cost
    },
    day_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // which day of the trip (Day 1, Day 2...)
    },
  },
  {
    tableName: "expenses",
    timestamps: true,
  },
);

module.exports = Expense;
