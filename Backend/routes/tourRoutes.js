const express = require('express');
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const {
  getAllTours, getTour,
  createTour, updateTour, deleteTour,
} = require('../controllers/tourController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// ── Multer config for image uploads ──────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // save files in uploads/ folder
  },
  filename: (req, file, cb) => {
    // unique filename = fieldname + timestamp + original extension
    // e.g. image-1704067200000.jpg
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // only accept images
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);  // accept
  } else {
    cb(new Error('Only jpeg, png, webp images are allowed'), false); // reject
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// ── Tour validation rules ─────────────────────────────────────
const tourValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration_days').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
];

// ── Routes ────────────────────────────────────────────────────
// Public routes — anyone can view tours
router.get('/', getAllTours);
router.get('/:id', getTour);

// Admin only routes — must be logged in AND be admin
router.post(
  '/',
  protect,
  adminOnly,
  upload.single('image'), // process one image with field name 'image'
  tourValidation,
  validate,
  createTour
);

router.put(
  '/:id',
  protect,
  adminOnly,
  upload.single('image'),
  validate,
  updateTour
);

router.delete('/:id', protect, adminOnly, deleteTour);

module.exports = router;