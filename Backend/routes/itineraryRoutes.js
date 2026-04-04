const express = require("express");
const { body } = require("express-validator");
const {
  generate,
  getMyItineraries,
  getItinerary,
  updateItinerary,
  updateActivity,
  deleteItinerary,
} = require("../controllers/itineraryController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

// all itinerary routes require login
router.use(protect);

// generate a new AI itinerary
router.post(
  "/generate",
  [
    body("destination")
      .trim()
      .notEmpty()
      .withMessage("Destination is required"),
    body("days")
      .isInt({ min: 1, max: 14 })
      .withMessage("Days must be between 1 and 14"),
    body("budget")
      .isFloat({ min: 1 })
      .withMessage("Budget must be a positive number"),
    body("interests")
      .isArray({ min: 1 })
      .withMessage("Select at least one interest"),
  ],
  validate,
  generate,
);

router.get("/", getMyItineraries);
router.get("/:id", getItinerary);
router.put("/:id", updateItinerary);
router.delete("/:id", deleteItinerary);

// update a single activity inside an itinerary
router.put("/:id/activities/:activityId", updateActivity);

module.exports = router;
