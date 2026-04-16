
const {
  Itinerary,
  ItineraryDay,
  ItineraryActivity,
  User,
} = require("../models/index");
const { generateItinerary } = require("../services/aiService");
const { sequelize } = require("../config/db");


// Add this helper at the top of the file
const VALID_CATEGORIES = [
  'sightseeing', 'food', 'adventure', 'transport',
  'accommodation', 'shopping', 'relaxation', 'culture',
];

const sanitizeCategory = (cat) => {
  if (!cat) return 'sightseeing';
  const lower = cat.toLowerCase().trim();
  return VALID_CATEGORIES.includes(lower) ? lower : 'sightseeing';
};

// ── GENERATE + SAVE AI ITINERARY ──────────────────────────────
// POST /api/itineraries/generate
const generate = async (req, res, next) => {
  try {
    const {
      destination,
      days,
      budget,
      travelers = 1,
      interests = [],
      travel_style = "comfort",
    } = req.body;

    // basic validation
    if (!destination || !days || !budget) {
      res.status(400);
      throw new Error("Destination, days and budget are required");
    }
    if (days < 1 || days > 14) {
      res.status(400);
      throw new Error("Days must be between 1 and 14");
    }
    if (interests.length === 0) {
      res.status(400);
      throw new Error("Please select at least one interest");
    }

    // call Claude AI
    const aiResult = await generateItinerary({
      destination,
      days: parseInt(days),
      budget: parseFloat(budget),
      travelers: parseInt(travelers),
      interests,
      travel_style,
    });

    // save everything inside a DB transaction
    // if anything fails, ALL changes are rolled back
    const itinerary = await sequelize.transaction(async (t) => {
      // 1. create the parent itinerary record
      const newItinerary = await Itinerary.create(
        {
          user_id: req.user.id,
          title: aiResult.title,
          destination,
          budget,
          days: parseInt(days),
          interests,
          travel_style,
          travelers: parseInt(travelers),
          total_estimated_cost: aiResult.total_estimated_cost,
          status: "draft",
          ai_generated: true,
        },
        { transaction: t },
      );

      // 2. create each day and its activities
      for (const dayData of aiResult.days) {
        const newDay = await ItineraryDay.create(
          {
            itinerary_id: newItinerary.id,
            day_number: dayData.day_number,
            theme: dayData.theme,
            summary: dayData.summary,
            total_day_cost: dayData.total_day_cost,
          },
          { transaction: t },
        );

        // 3. create activities for this day
        const activities = dayData.activities.map((act) => ({
          day_id: newDay.id,
          time: act.time || "09:00 AM",
          activity: act.activity || "Activity",
          description: act.description || "",
          category: sanitizeCategory(act.category), // ← sanitize
          location: act.location || "",
          estimated_cost: parseFloat(act.estimated_cost) || 0,
          duration_minutes: act.duration_minutes || 60,
          tips: act.tips || "",
          sort_order: act.sort_order || 0,
        }));

        await ItineraryActivity.bulkCreate(activities, { transaction: t });
      }

      return newItinerary;
    });

    // fetch full itinerary with all nested data to return
    const full = await Itinerary.findByPk(itinerary.id, {
      include: [
        {
          model: ItineraryDay,
          include: [{ model: ItineraryActivity }],
        },
      ],
    });

    res.status(201).json({ success: true, itinerary: full });
  } catch (error) {
    if (error instanceof SyntaxError) {
      res.status(500);
      return next(
        new Error(
          "AI returned an invalid response. Please try generating again.",
        ),
      );
    }
    if (
      error.message?.includes("API_KEY") ||
      error.message?.includes("api key")
    ) {
      res.status(500);
      return next(
        new Error("AI service configuration error. Please contact support."),
      );
    }
    if (error.message?.includes("quota") || error.message?.includes("limit")) {
      res.status(429);
      return next(
        new Error(
          "AI service quota exceeded. Please try again after a few minutes.",
        ),
      );
    }
    if (
      error.message?.includes("truncated") ||
      error.message?.includes("Data too long")
    ) {
      res.status(500);
      return next(
        new Error(
          "AI generated invalid data. Please try again with different inputs.",
        ),
      );
    }
    if (error.status === 503 || error.message?.includes("overloaded")) {
      res.status(503);
      return next(
        new Error(
          "AI service is temporarily unavailable. Please try again in a moment.",
        ),
      );
    }
    next(error);
  }
};

// ── GET ALL MY ITINERARIES ────────────────────────────────────
// GET /api/itineraries
const getMyItineraries = async (req, res, next) => {
  try {
    const itineraries = await Itinerary.findAll({
      where: { user_id: req.user.id },
      order: [["createdAt", "DESC"]],
      // don't include full days here — too much data for a list view
      attributes: [
        "id",
        "title",
        "destination",
        "days",
        "budget",
        "total_estimated_cost",
        "travel_style",
        "status",
        "ai_generated",
        "travelers",
        "createdAt",
      ],
    });

    res.status(200).json({ success: true, itineraries });
  } catch (error) {
    next(error);
  }
};

// ── GET SINGLE ITINERARY (full with days + activities) ────────
// GET /api/itineraries/:id
const getItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findByPk(req.params.id, {
      include: [
        {
          model: ItineraryDay,
          include: [
            {
              model: ItineraryActivity,
              order: [["sort_order", "ASC"]],
            },
          ],
        },
      ],
    });

    if (!itinerary) {
      res.status(404);
      throw new Error("Itinerary not found");
    }

    // only owner can view
    if (itinerary.user_id !== req.user.id) {
      res.status(403);
      throw new Error("Not authorized");
    }

    res.status(200).json({ success: true, itinerary });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE ITINERARY (title, notes, status) ───────────────────
// PUT /api/itineraries/:id
const updateItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findByPk(req.params.id);

    if (!itinerary) {
      res.status(404);
      throw new Error("Itinerary not found");
    }
    if (itinerary.user_id !== req.user.id) {
      res.status(403);
      throw new Error("Not authorized");
    }

    const { title, notes, status } = req.body;
    await itinerary.update({ title, notes, status });

    res.status(200).json({ success: true, itinerary });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE A SINGLE ACTIVITY (inline edit) ────────────────────
// PUT /api/itineraries/:id/activities/:activityId
const updateActivity = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findByPk(req.params.id);

    if (!itinerary) {
      res.status(404);
      throw new Error("Itinerary not found");
    }
    if (itinerary.user_id !== req.user.id) {
      res.status(403);
      throw new Error("Not authorized");
    }

    const activity = await ItineraryActivity.findByPk(req.params.activityId);

    if (!activity) {
      res.status(404);
      throw new Error("Activity not found");
    }

    const {
      time,
      activity: actName,
      description,
      estimated_cost,
      location,
      tips,
      category,
    } = req.body;

    await activity.update({
      time,
      activity: actName,
      description,
      estimated_cost,
      location,
      tips,
      category,
    });

    // recalculate day total cost after edit
    const day = await ItineraryDay.findByPk(activity.day_id, {
      include: [{ model: ItineraryActivity }],
    });

    const dayTotal = day.ItineraryActivities.reduce(
      (sum, a) => sum + parseFloat(a.estimated_cost || 0),
      0,
    );
    await day.update({ total_day_cost: dayTotal });

    // recalculate itinerary total cost
    const allDays = await ItineraryDay.findAll({
      where: { itinerary_id: itinerary.id },
      include: [{ model: ItineraryActivity }],
    });
    const itineraryTotal = allDays.reduce(
      (sum, d) => sum + parseFloat(d.total_day_cost || 0),
      0,
    );
    await itinerary.update({ total_estimated_cost: itineraryTotal });

    res.status(200).json({ success: true, activity });
  } catch (error) {
    next(error);
  }
};

// ── DELETE ITINERARY ──────────────────────────────────────────
// DELETE /api/itineraries/:id
const deleteItinerary = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findByPk(req.params.id);

    if (!itinerary) {
      res.status(404);
      throw new Error("Itinerary not found");
    }
    if (itinerary.user_id !== req.user.id) {
      res.status(403);
      throw new Error("Not authorized");
    }

    // cascade delete handles days and activities automatically
    await itinerary.destroy();

    res.status(200).json({ success: true, message: "Itinerary deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generate,
  getMyItineraries,
  getItinerary,
  updateItinerary,
  updateActivity,
  deleteItinerary,
};
