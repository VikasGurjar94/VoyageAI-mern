const { Review, User, Tour, Booking } = require('../models/index');

// POST /api/tours/:tourId/reviews
const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const tour_id = req.params.tourId;

    // check tour exists
    const tour = await Tour.findByPk(tour_id);
    if (!tour) {
      res.status(404);
      throw new Error('Tour not found');
    }

    // check user actually booked this tour (can't review without booking)
    const booking = await Booking.findOne({
      where: {
        user_id: req.user.id,
        tour_id,
        status: 'confirmed', // must be confirmed, not just pending
      },
    });
    if (!booking) {
      res.status(403);
      throw new Error('You can only review tours you have completed');
    }

    // check user hasn't already reviewed this tour
    const existing = await Review.findOne({
      where: { user_id: req.user.id, tour_id },
    });
    if (existing) {
      res.status(400);
      throw new Error('You have already reviewed this tour');
    }

    const review = await Review.create({
      user_id: req.user.id,
      tour_id,
      rating,
      comment,
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// GET /api/tours/:tourId/reviews
const getTourReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { tour_id: req.params.tourId },
      include: [{ model: User, attributes: ['name', 'avatar'] }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reviews/:id  (admin or review owner)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this review');
    }

    await review.destroy();
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getTourReviews, deleteReview };