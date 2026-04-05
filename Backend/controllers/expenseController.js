const {
  Expense,
  Itinerary,
  ItineraryDay,
  ItineraryActivity,
} = require("../models/index");
const { Op } = require("sequelize");
const { Parser } = require("json2csv");

// ── ADD EXPENSE ───────────────────────────────────────────────
// POST /api/expenses
const addExpense = async (req, res, next) => {
  try {
    const {
      itinerary_id,
      title,
      amount,
      category = "other",
      date,
      payment_method = "cash",
      notes,
      day_number,
    } = req.body;

    // verify itinerary belongs to this user
    const itinerary = await Itinerary.findOne({
      where: { id: itinerary_id, user_id: req.user.id },
    });

    if (!itinerary) {
      res.status(404);
      throw new Error("Itinerary not found");
    }

    const expense = await Expense.create({
      itinerary_id,
      user_id: req.user.id,
      title,
      amount,
      category,
      date,
      payment_method,
      notes,
      day_number,
      is_planned: false, // user added = actual spend
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

// ── GET ALL EXPENSES FOR AN ITINERARY ─────────────────────────
// GET /api/expenses/itinerary/:itineraryId
const getExpenses = async (req, res, next) => {
  try {
    const { itineraryId } = req.params;

    // verify ownership
    const itinerary = await Itinerary.findOne({
      where: { id: itineraryId, user_id: req.user.id },
    });

    if (!itinerary) {
      res.status(404);
      throw new Error("Itinerary not found");
    }

    const expenses = await Expense.findAll({
      where: { itinerary_id: itineraryId },
      order: [
        ["date", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    res.status(200).json({ success: true, expenses });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE EXPENSE ────────────────────────────────────────────
// PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error("Expense not found");
    }

    if (expense.user_id !== req.user.id) {
      res.status(403);
      throw new Error("Not authorized");
    }

    const { title, amount, category, date, payment_method, notes, day_number } =
      req.body;

    await expense.update({
      title,
      amount,
      category,
      date,
      payment_method,
      notes,
      day_number,
    });

    res.status(200).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

// ── DELETE EXPENSE ────────────────────────────────────────────
// DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      res.status(404);
      throw new Error("Expense not found");
    }

    if (expense.user_id !== req.user.id) {
      res.status(403);
      throw new Error("Not authorized");
    }

    await expense.destroy();

    res.status(200).json({ success: true, message: "Expense deleted" });
  } catch (error) {
    next(error);
  }
};

// ── IMPORT PLANNED COSTS FROM ITINERARY ───────────────────────
// POST /api/expenses/itinerary/:itineraryId/import-planned
// pulls estimated_cost from each activity into expenses table
const importPlanned = async (req, res, next) => {
  try {
    const { itineraryId } = req.params;

    const itinerary = await Itinerary.findOne({
      where: { id: itineraryId, user_id: req.user.id },
      include: [
        {
          model: ItineraryDay,
          include: [{ model: ItineraryActivity }],
        },
      ],
    });

    if (!itinerary) {
      res.status(404);
      throw new Error("Itinerary not found");
    }

    // delete existing planned expenses first to avoid duplicates
    await Expense.destroy({
      where: { itinerary_id: itineraryId, is_planned: true },
    });

    // create a planned expense for each activity with a cost
    const toCreate = [];

    itinerary.ItineraryDays?.forEach((day) => {
      day.ItineraryActivities?.forEach((act) => {
        if (parseFloat(act.estimated_cost) > 0) {
          toCreate.push({
            itinerary_id: itineraryId,
            user_id: req.user.id,
            title: act.activity,
            amount: act.estimated_cost,
            category: mapCategory(act.category),
            date: itinerary.createdAt, // placeholder date
            payment_method: "cash",
            day_number: day.day_number,
            is_planned: true,
            notes: `Planned: ${act.location || ""}`,
          });
        }
      });
    });

    await Expense.bulkCreate(toCreate);

    res.status(201).json({
      success: true,
      message: `${toCreate.length} planned expenses imported`,
      count: toCreate.length,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET SUMMARY / ANALYTICS ───────────────────────────────────
// GET /api/expenses/itinerary/:itineraryId/summary
const getSummary = async (req, res, next) => {
  try {
    const { itineraryId } = req.params;

    const itinerary = await Itinerary.findOne({
      where: { id: itineraryId, user_id: req.user.id },
    });

    if (!itinerary) {
      res.status(404);
      throw new Error("Itinerary not found");
    }

    // get all actual (non-planned) expenses
    const actual = await Expense.findAll({
      where: { itinerary_id: itineraryId, is_planned: false },
      order: [["date", "ASC"]],
    });

    // get all planned expenses
    const planned = await Expense.findAll({
      where: { itinerary_id: itineraryId, is_planned: true },
    });

    const totalSpent = actual.reduce((s, e) => s + parseFloat(e.amount), 0);
    const totalPlanned = planned.reduce((s, e) => s + parseFloat(e.amount), 0);
    const totalBudget = parseFloat(itinerary.budget);

    // ── by category ───────────────────────────────────────────
    const byCategory = {};
    actual.forEach((e) => {
      byCategory[e.category] =
        (byCategory[e.category] || 0) + parseFloat(e.amount);
    });

    // format for pie chart
    const categoryData = Object.entries(byCategory).map(([name, value]) => ({
      name,
      value: Math.round(value),
      percent: Math.round((value / totalSpent) * 100) || 0,
    }));

    // ── by day ────────────────────────────────────────────────
    const byDay = {};
    actual.forEach((e) => {
      const key = e.day_number ? `Day ${e.day_number}` : e.date;
      byDay[key] = (byDay[key] || 0) + parseFloat(e.amount);
    });

    const dailyData = Object.entries(byDay)
      .map(([day, amount]) => ({ day, amount: Math.round(amount) }))
      .sort((a, b) => {
        const numA = parseInt(a.day.replace("Day ", "")) || 0;
        const numB = parseInt(b.day.replace("Day ", "")) || 0;
        return numA - numB;
      });

    // ── by payment method ─────────────────────────────────────
    const byMethod = {};
    actual.forEach((e) => {
      byMethod[e.payment_method] =
        (byMethod[e.payment_method] || 0) + parseFloat(e.amount);
    });

    // ── planned vs actual per category ────────────────────────
    const allCategories = new Set([
      ...Object.keys(byCategory),
      ...planned.map((e) => e.category),
    ]);

    const plannedByCategory = {};
    planned.forEach((e) => {
      plannedByCategory[e.category] =
        (plannedByCategory[e.category] || 0) + parseFloat(e.amount);
    });

    const comparisonData = [...allCategories].map((cat) => ({
      category: cat,
      planned: Math.round(plannedByCategory[cat] || 0),
      actual: Math.round(byCategory[cat] || 0),
    }));

    // ── top expenses ──────────────────────────────────────────
    const topExpenses = [...actual]
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 5)
      .map((e) => ({
        title: e.title,
        amount: parseFloat(e.amount),
        category: e.category,
      }));

    res.status(200).json({
      success: true,
      summary: {
        totalSpent: Math.round(totalSpent),
        totalPlanned: Math.round(totalPlanned),
        totalBudget,
        remaining: Math.round(totalBudget - totalSpent),
        isOverBudget: totalSpent > totalBudget,
        overBy:
          totalSpent > totalBudget ? Math.round(totalSpent - totalBudget) : 0,
        savedVsPlan: Math.round(totalPlanned - totalSpent),
        avgDailySpend:
          itinerary.days > 0 ? Math.round(totalSpent / itinerary.days) : 0,
        totalExpenses: actual.length,
        categoryData,
        dailyData,
        comparisonData,
        byMethod,
        topExpenses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── EXPORT TO CSV ─────────────────────────────────────────────
// GET /api/expenses/itinerary/:itineraryId/export
const exportCSV = async (req, res, next) => {
  try {
    const { itineraryId } = req.params;

    const itinerary = await Itinerary.findOne({
      where: { id: itineraryId, user_id: req.user.id },
    });

    if (!itinerary) {
      res.status(404);
      throw new Error("Itinerary not found");
    }

    const expenses = await Expense.findAll({
      where: { itinerary_id: itineraryId },
      order: [["date", "ASC"]],
    });

    const data = expenses.map((e) => ({
      Title: e.title,
      Amount: parseFloat(e.amount),
      Category: e.category,
      Date: e.date,
      "Day Number": e.day_number || "",
      "Payment Method": e.payment_method,
      Type: e.is_planned ? "Planned" : "Actual",
      Notes: e.notes || "",
    }));

    const fields = [
      "Title",
      "Amount",
      "Category",
      "Date",
      "Day Number",
      "Payment Method",
      "Type",
      "Notes",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    const filename = `expenses-${itinerary.destination}-${Date.now()}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// ── Helper: map itinerary category to expense category ────────
const mapCategory = (cat) => {
  const map = {
    sightseeing: "sightseeing",
    food: "food",
    adventure: "adventure",
    transport: "transport",
    accommodation: "accommodation",
    shopping: "shopping",
    relaxation: "other",
    culture: "sightseeing",
  };
  return map[cat] || "other";
};

module.exports = {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  importPlanned,
  getSummary,
  exportCSV,
};
