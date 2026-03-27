const { Tour, Review, User } = require('../models/index');
const { Op } = require('sequelize'); // Op = operators for WHERE clauses

// ─── GET ALL TOURS ─────────────────────────────────────────
// GET /api/tours
const getAllTours = async (req, res, next) => {
  try {
    // extract query params for search + filter
    // e.g. /api/tours?destination=Goa&minPrice=5000&maxPrice=20000
    const {
      destination,
      minPrice,
      maxPrice,
      difficulty,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // build WHERE clause dynamically
    const where = { is_active: true };

    if (destination) {
      // Op.iLike = case-insensitive LIKE — finds "goa", "GOA", "Goa"
      where.destination = { [Op.like]: `%${destination}%` };
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice; // greater than or equal
      if (maxPrice) where.price[Op.lte] = maxPrice; // less than or equal
    }

    // sorting
    let order = [['createdAt', 'DESC']]; // newest first by default
    if (sort === 'price_asc')  order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];
    if (sort === 'duration')   order = [['duration_days', 'ASC']];

    // pagination
    const offset = (page - 1) * limit; // page 2 with limit 10 → skip 10

    // fetch from DB
    const { count, rows: tours } = await Tour.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Review,
          attributes: ['rating'], // only get rating — no need for full review
        },
      ],
    });

    res.status(200).json({
      success: true,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      tours,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE TOUR ────────────────────────────────────────
// GET /api/tours/:id
const getTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByPk(req.params.id, {
      include: [
        {
          model: Review,
          include: [
            {
              model: User,
              attributes: ['name', 'avatar'], // reviewer name and photo
            },
          ],
        },
      ],
    });

    if (!tour) {
      res.status(404);
      throw new Error('Tour not found');
    }

    res.status(200).json({ success: true, tour });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE TOUR ────────────────────────────────────────────
// POST /api/tours  (admin only)
const createTour = async (req, res, next) => {
  try {
    const {
      title, description, destination,
      price, duration_days, max_group_size, difficulty,
    } = req.body;

    // if admin uploaded an image, multer puts it in req.file
    const image = req.file ? req.file.filename : null;

    const tour = await Tour.create({
      title,
      description,
      destination,
      price,
      duration_days,
      max_group_size,
      difficulty,
      image,
    });

    res.status(201).json({ success: true, tour });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE TOUR ────────────────────────────────────────────
// PUT /api/tours/:id  (admin only)
const updateTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByPk(req.params.id);

    if (!tour) {
      res.status(404);
      throw new Error('Tour not found');
    }

    // if new image uploaded, use it — otherwise keep old one
    const image = req.file ? req.file.filename : tour.image;

    await tour.update({ ...req.body, image });

    res.status(200).json({ success: true, tour });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE TOUR ────────────────────────────────────────────
// DELETE /api/tours/:id  (admin only)
const deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByPk(req.params.id);

    if (!tour) {
      res.status(404);
      throw new Error('Tour not found');
    }

    // soft delete — just deactivate instead of actually deleting
    // this preserves booking history that references this tour
    await tour.update({ is_active: false });

    res.status(200).json({
      success: true,
      message: 'Tour deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTours, getTour, createTour, updateTour, deleteTour };