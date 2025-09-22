const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Report = require('../models/Report');
const User = require('../models/User');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @route   POST /api/reports
// @desc    Create a new illegal dumping report
// @access  Private
router.post('/', auth, upload.single('image'), [
  body('title', 'Title is required').not().isEmpty().trim(),
  body('description', 'Description is required').not().isEmpty().trim(),
  body('severity', 'Severity is required').isIn(['low', 'medium', 'high', 'critical']),
  body('latitude', 'Latitude is required').isFloat({ min: 7.0, max: 7.5 }),
  body('longitude', 'Longitude is required').isFloat({ min: 80.0, max: 81.0 }),
  body('address', 'Address is required').not().isEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const { title, description, severity, latitude, longitude, address } = req.body;

    // Validate coordinates are within Kandy area
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    // Kandy area boundaries (approximate)
    if (lat < 7.0 || lat > 7.5 || lng < 80.0 || lng > 81.0) {
      return res.status(400).json({ 
        message: 'Location must be within Kandy area' 
      });
    }

    // Create new report
    const report = new Report({
      title,
      description,
      severity,
      user: req.user.id,
      latitude: lat,
      longitude: lng,
      address,
      imageUrl: `/uploads/${req.file.filename}`
    });

    await report.save();

    // Populate user information for response
    await report.populate('user', 'name email role');

    res.status(201).json({
      message: 'Report submitted successfully',
      report: report.getPublicData()
    });

  } catch (error) {
    console.error('Report creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports
// @desc    Get all reports (with filtering)
// @access  Private (Admin/Manager only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user has admin privileges
    if (!['Admin', 'Manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { status, priority, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get reports with pagination
    const reports = await Report.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Report.countDocuments(filter);

    res.json({
      reports: reports.map(report => report.getPublicData()),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReports: total,
        hasNextPage: skip + reports.length < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/my-reports
// @desc    Get current user's reports
// @access  Private
router.get('/my-reports', auth, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id })
      .populate('user', 'name email role')
      .populate('resolvedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      reports: reports.map(report => report.getPublicData())
    });

  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/:id
// @desc    Get a specific report
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('resolvedBy', 'name email role');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user can access this report
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager' && report.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      report: report.getPublicData()
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reports/:id/status
// @desc    Update report status (Admin/Manager only)
// @access  Private (Admin/Manager only)
router.put('/:id/status', auth, [
  body('status', 'Status is required').isIn(['pending', 'under_review', 'in_progress', 'resolved', 'rejected']),
  body('priority', 'Priority is required').isIn(['low', 'medium', 'high', 'critical']),
  body('adminNotes', 'Admin notes').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    // Check if user has admin privileges
    if (!['Admin', 'Manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, priority, adminNotes } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Update report
    report.status = status;
    report.priority = priority;
    if (adminNotes) report.adminNotes = adminNotes;

    // Set resolvedAt and resolvedBy if status is resolved
    if (status === 'resolved' && report.status !== 'resolved') {
      report.resolvedAt = Date.now();
      report.resolvedBy = req.user.id;
    }

    await report.save();

    // Populate user information
    await report.populate('user', 'name email role');
    await report.populate('resolvedBy', 'name email role');

    res.json({
      message: 'Report status updated successfully',
      report: report.getPublicData()
    });

  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reports/:id
// @desc    Delete a report (Admin only)
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({ message: 'Report deleted successfully' });

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/stats/overview
// @desc    Get report statistics overview (Admin/Manager only)
// @access  Private (Admin/Manager only)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    // Check if user has admin privileges
    if (!['Admin', 'Manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const inProgressReports = await Report.countDocuments({ status: 'in_progress' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    const rejectedReports = await Report.countDocuments({ status: 'rejected' });

    // Get reports by priority
    const criticalReports = await Report.countDocuments({ priority: 'critical' });
    const highPriorityReports = await Report.countDocuments({ priority: 'high' });
    const mediumPriorityReports = await Report.countDocuments({ priority: 'medium' });
    const lowPriorityReports = await Report.countDocuments({ priority: 'low' });

    // Get recent reports (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentReports = await Report.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      summary: {
        total: totalReports,
        pending: pendingReports,
        inProgress: inProgressReports,
        resolved: resolvedReports,
        rejected: rejectedReports,
        recent: recentReports
      },
      priority: {
        critical: criticalReports,
        high: highPriorityReports,
        medium: mediumPriorityReports,
        low: lowPriorityReports
      }
    });

  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
