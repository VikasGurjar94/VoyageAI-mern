const { TourItineraryDay, Tour } = require("../models/index");

// ── GET ITINERARY DAYS FOR A TOUR ─────────────────────────────
// GET /api/tours/:tourId/itinerary
const getItinerary = async (req, res, next) => {
  try {
    const { tourId } = req.params;

    const tour = await Tour.findByPk(tourId);
    if (!tour || !tour.is_active) {
      res.status(404);
      throw new Error("Tour not found");
    }

    const days = await TourItineraryDay.findAll({
      where: { tour_id: tourId },
      order: [["day_number", "ASC"]],
    });

    res.status(200).json({ success: true, days });
  } catch (error) {
    next(error);
  }
};

// ── ADD / REPLACE ALL ITINERARY DAYS (admin) ──────────────────
// POST /api/tours/:tourId/itinerary
// sends full array of days — replaces existing ones
const saveItinerary = async (req, res, next) => {
  try {
    const { tourId } = req.params;
    const { days } = req.body;

    const tour = await Tour.findByPk(tourId);
    if (!tour) {
      res.status(404);
      throw new Error("Tour not found");
    }

    if (!days || !Array.isArray(days) || days.length === 0) {
      res.status(400);
      throw new Error("Days array is required");
    }

    // delete all existing days for this tour first
    await TourItineraryDay.destroy({ where: { tour_id: tourId } });

    // create new days
    const created = await TourItineraryDay.bulkCreate(
      days.map((day, index) => ({
        tour_id: tourId,
        day_number: day.day_number || index + 1,
        title: day.title,
        description: day.description,
        location: day.location || "",
        activities: day.activities || [],
        meals: day.meals || { breakfast: false, lunch: false, dinner: false },
        accommodation: day.accommodation || "",
        distance_km: day.distance_km || 0,
        image: day.image || null,
      })),
    );

    res.status(201).json({
      success: true,
      message: `${created.length} itinerary days saved`,
      days: created,
    });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE SINGLE DAY ─────────────────────────────────────────
// PUT /api/tours/:tourId/itinerary/:dayId
const updateDay = async (req, res, next) => {
  try {
    const { tourId, dayId } = req.params;

    const day = await TourItineraryDay.findOne({
      where: { id: dayId, tour_id: tourId },
    });

    if (!day) {
      res.status(404);
      throw new Error("Itinerary day not found");
    }

    const {
      title,
      description,
      location,
      activities,
      meals,
      accommodation,
      distance_km,
      day_number,
    } = req.body;

    await day.update({
      title,
      description,
      location,
      activities,
      meals,
      accommodation,
      distance_km,
      day_number,
    });

    res.status(200).json({ success: true, day });
  } catch (error) {
    next(error);
  }
};

// ── DELETE SINGLE DAY ─────────────────────────────────────────
// DELETE /api/tours/:tourId/itinerary/:dayId
const deleteDay = async (req, res, next) => {
  try {
    const { tourId, dayId } = req.params;

    const day = await TourItineraryDay.findOne({
      where: { id: dayId, tour_id: tourId },
    });

    if (!day) {
      res.status(404);
      throw new Error("Day not found");
    }

    await day.destroy();

    res.status(200).json({ success: true, message: "Day deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getItinerary, saveItinerary, updateDay, deleteDay };
