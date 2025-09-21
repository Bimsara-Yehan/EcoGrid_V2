const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Reporting = require('../models/Reporting');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'reporting-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

// Create new reporting entry
router.post('/', auth, upload.single('image'), [
  body('landmarks').not().isEmpty().trim(),
  body('latitude').isFloat(),
  body('longitude').isFloat(),
  body('address').not().isEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (!req.file) return res.status(400).json({ message: 'Image is required' });

    const { landmarks, latitude, longitude, address } = req.body;

    const doc = new Reporting({
      landmarks,
      location: { lat: parseFloat(latitude), lng: parseFloat(longitude), address },
      imageUrl: `/uploads/${req.file.filename}`,
      userId: req.user.id
    });

    await doc.save();
    res.status(201).json({ message: 'Reporting submitted', reporting: doc });
  } catch (error) {
    console.error('Reporting create error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my reporting entries
router.get('/mine', auth, async (req, res) => {
  try {
    const items = await Reporting.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    console.error('Reporting fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


