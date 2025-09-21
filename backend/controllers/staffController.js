const Staff = require('../models/Staff');
const mongoose = require('mongoose');

// @desc    Get all staff
// @route   GET /api/staff
// @access  Public
const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single staff member
// @route   GET /api/staff/:id
// @access  Public
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new staff member
// @route   POST /api/staff
// @access  Public
const createStaff = async (req, res) => {
  try {
    console.log('Creating staff with payload:', req.body);
    
    // Normalize and sanitize inputs to reduce accidental duplicates
    const payload = { ...req.body };
    if (typeof payload.gmail === 'string') payload.gmail = payload.gmail.trim().toLowerCase();
    if (typeof payload.nic === 'string') payload.nic = payload.nic.trim();
    if (typeof payload.name === 'string') payload.name = payload.name.trim();
    if (typeof payload.role === 'string') payload.role = payload.role.trim();
    if (typeof payload.phone === 'string') payload.phone = payload.phone.trim();
    if (typeof payload.address === 'string') payload.address = payload.address.trim();

    // Basic required-field validation with helpful messages
    const missing = [];
    ['name','role','dateOfBirth','gender','nic','gmail','phone','address'].forEach((k) => {
      if (payload[k] === undefined || payload[k] === null || String(payload[k]).trim() === '') missing.push(k);
    });
    if (missing.length) {
      return res.status(400).json({ success: false, error: `Missing required field(s): ${missing.join(', ')}` });
    }

    // Validate dateOfBirth
    const dob = new Date(payload.dateOfBirth);
    if (Number.isNaN(dob.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid dateOfBirth. Expected a valid date (YYYY-MM-DD).' });
    }
    payload.dateOfBirth = dob; // ensure Date object

    // Validate gender enum early (more user-friendly than Mongoose default)
    const allowedGenders = ['Male', 'Female', 'Other'];
    if (!allowedGenders.includes(payload.gender)) {
      return res.status(400).json({ success: false, error: `Invalid gender. Allowed values: ${allowedGenders.join(', ')}` });
    }

    // Map to legacy collection validator (EcoGrid_V2.staffs) expected fields
    if (!payload.staffType) {
      const roleLower = String(payload.role || '').toLowerCase();
      if (roleLower.includes('driver')) payload.staffType = 'driver';
      else if (roleLower.includes('scheduler')) payload.staffType = 'scheduler';
      else if (roleLower.includes('zone')) payload.staffType = 'zone_manager';
      else if (roleLower.includes('incineration')) payload.staffType = 'incineration_operator';
      else if (roleLower.includes('finance')) payload.staffType = 'finance_manager';
      else payload.staffType = 'scheduler';
    }
    if (payload.staffType === 'driver' && payload.driver === undefined) payload.driver = {};
    if (payload.payProfile === undefined) payload.payProfile = {};
    if (!payload.userId) {
      payload.userId = new mongoose.Types.ObjectId();
    }
    if (!payload.seedTag) {
      payload.seedTag = 'APP_CREATE';
    }

    console.log('Final payload before creation:', payload);
    const staff = await Staff.create(payload);
    console.log('Staff created successfully:', staff._id);

    res.status(201).json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Create staff failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      errors: error.errors
    });
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else if (error.code === 11000) {
      // Build a clearer duplicate message
      const dupField = error.keyPattern ? Object.keys(error.keyPattern)[0] : undefined;
      const dupValue = error.keyValue ? Object.values(error.keyValue)[0] : undefined;
      return res.status(400).json({
        success: false,
        error: dupField ? `Duplicate ${dupField}: ${dupValue}` : 'Duplicate field value entered'
      });
    } else if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: `Invalid data type for field: ${error.path}`
      });
    } else {
      res.status(500).json({
        success: false,
        error: error?.message || 'Server Error'
      });
    }
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Public
const updateStaff = async (req, res) => {
  try {
    // Sanitize and format payload
    const payload = { ...req.body };
    if (typeof payload.gmail === 'string') payload.gmail = payload.gmail.trim().toLowerCase();
    if (typeof payload.nic === 'string') payload.nic = payload.nic.trim();
    if (typeof payload.name === 'string') payload.name = payload.name.trim();
    if (typeof payload.role === 'string') payload.role = payload.role.trim();
    if (typeof payload.phone === 'string') payload.phone = payload.phone.trim();
    if (typeof payload.address === 'string') payload.address = payload.address.trim();

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        new: true,
        runValidators: true
      }
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: staff
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate field value entered'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Public
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};
