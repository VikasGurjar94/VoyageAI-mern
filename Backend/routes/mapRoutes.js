const express = require("express");
const {
  geocode,
  geocodeMany,
  nearby,
} = require("../controllers/mapController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// all map routes require login
router.use(protect);

router.get("/geocode", geocode);
router.post("/geocode-many", geocodeMany);
router.get("/nearby", nearby);

module.exports = router;
