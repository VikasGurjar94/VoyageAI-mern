const express = require("express");
const { body } = require("express-validator");
const {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  importPlanned,
  getSummary,
  exportCSV,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(protect);

// add a new expense
router.post(
  "/",
  [
    body("itinerary_id").isInt().withMessage("Itinerary ID is required"),
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("date").isDate().withMessage("Valid date is required"),
  ],
  validate,
  addExpense,
);

// get all expenses for an itinerary
router.get("/itinerary/:itineraryId", getExpenses);

// get summary / analytics for an itinerary
router.get("/itinerary/:itineraryId/summary", getSummary);

// export expenses to CSV
router.get("/itinerary/:itineraryId/export", exportCSV);

// import planned costs from itinerary activities
router.post("/itinerary/:itineraryId/import-planned", importPlanned);

// update and delete single expense
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
