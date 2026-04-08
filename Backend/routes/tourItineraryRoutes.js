const express = require("express");
const { body } = require("express-validator");
const {
  getItinerary,
  saveItinerary,
  updateDay,
  deleteDay,
} = require("../controllers/tourItineraryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router({ mergeParams: true });
// mergeParams lets us access :tourId from the parent router

// public — anyone can view a tour's itinerary
router.get("/", getItinerary);

// admin only — manage itinerary
router.post(
  "/",
  protect,
  adminOnly,
  [
    body("days")
      .isArray({ min: 1 })
      .withMessage("Days array with at least 1 day is required"),
    body("days.*.title").notEmpty().withMessage("Each day must have a title"),
    body("days.*.description")
      .notEmpty()
      .withMessage("Each day must have a description"),
  ],
  validate,
  saveItinerary,
);

router.put("/:dayId", protect, adminOnly, updateDay);
router.delete("/:dayId", protect, adminOnly, deleteDay);

module.exports = router;
