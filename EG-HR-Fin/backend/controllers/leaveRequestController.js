const LeaveRequest = require('../models/LeaveRequest');
const mongoose = require('mongoose');

// Create new leave request (robust input normalization and validation)
const createLeaveRequest = async (req, res) => {
  try {
    const {
      staffID,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason
    } = req.body;

    // Basic required fields
    if (!staffID || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Ensure valid ObjectId
    if (!LeaveRequest.db || !LeaveRequest.db.base?.Types?.ObjectId?.isValid(staffID)) {
      // Fallback to mongoose if available via model
      const isValid = require('mongoose').Types.ObjectId.isValid(staffID);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid staffID' });
      }
    }

    // Normalize dates (support yyyy-mm-dd from input type=date)
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid startDate or endDate' });
    }
    if (start > end) {
      return res.status(400).json({ success: false, message: 'startDate must be before endDate' });
    }

    // Compute totalDays if missing/invalid
    let computedTotalDays = Number(totalDays);
    if (!Number.isFinite(computedTotalDays) || computedTotalDays < 1) {
      const diffTime = Math.abs(end - start);
      computedTotalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
    }

    // Map to validator-required names (staffId,type,from,to,status)
    const normalizedStatus = 'pending';
    const leaveRequest = new LeaveRequest({
      staffID: new mongoose.Types.ObjectId(staffID),
      leaveType,
      startDate: start,
      endDate: end,
      totalDays: computedTotalDays,
      reason: String(reason).trim(),
      status: normalizedStatus,
      requestedDate: new Date(),
      staffId: new mongoose.Types.ObjectId(staffID),
      type: leaveType,
      from: start,
      to: end
    });

    const savedRequest = await leaveRequest.save();

    const populatedRequest = await LeaveRequest.findById(savedRequest._id)
      .populate('staffID', 'name role gmail phone')
      .populate('approvedRejectedBy', 'name role');

    return res.status(201).json({
      success: true,
      message: 'Leave request created successfully',
      data: populatedRequest
    });
  } catch (error) {
    console.error('Create leave request failed:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(v => v.message);
      return res.status(400).json({ success: false, error: messages });
    }
    if (error.code === 11000) {
      const dupField = error.keyPattern ? Object.keys(error.keyPattern)[0] : undefined;
      const dupValue = error.keyValue ? Object.values(error.keyValue)[0] : undefined;
      return res.status(400).json({ success: false, error: dupField ? `Duplicate ${dupField}: ${dupValue}` : 'Duplicate field value entered' });
    }
    return res.status(500).json({ success: false, error: error?.message || 'Failed to create leave request' });
  }
};

// Get all leave requests with staff details populated
const getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({})
      .populate('staffID', 'name role gmail phone')
      .populate('approvedRejectedBy', 'name role')
      .sort({ requestedDate: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      count: leaveRequests.length,
      data: leaveRequests
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests',
      error: error.message
    });
  }
};

// Get single leave request by ID
const getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const leaveRequest = await LeaveRequest.findById(id)
      .populate('staffID', 'name role gmail phone address')
      .populate('approvedRejectedBy', 'name role');

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: leaveRequest
    });
  } catch (error) {
    console.error('Error fetching leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave request',
      error: error.message
    });
  }
};

// Update leave request
const updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    // Normalize legacy → validator field names and types
    const updateData = {};
    if (body.staffID) {
      updateData.staffID = body.staffID;
      updateData.staffId = body.staffID; // validator name
    }
    if (body.leaveType) {
      updateData.leaveType = body.leaveType;
      updateData.type = body.leaveType; // validator name
    }
    if (body.startDate) {
      const d = new Date(body.startDate);
      if (!Number.isNaN(d.getTime())) {
        updateData.startDate = d;
        updateData.from = d; // validator name
      }
    }
    if (body.endDate) {
      const d = new Date(body.endDate);
      if (!Number.isNaN(d.getTime())) {
        updateData.endDate = d;
        updateData.to = d; // validator name
      }
    }
    if (body.totalDays !== undefined) {
      const n = Number(body.totalDays);
      if (Number.isFinite(n)) updateData.totalDays = Math.max(1, Math.floor(n));
    }
    if (body.reason !== undefined) updateData.reason = String(body.reason).trim();
    if (body.status) {
      const lower = String(body.status).toLowerCase();
      updateData.status = lower; // model accepts lowercase
    }

    // If status is being updated, set approvedRejectedDate
    if (updateData.status && (updateData.status === 'approved' || updateData.status === 'rejected')) {
      updateData.approvedRejectedDate = new Date();
    }

    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('staffID', 'name role gmail phone')
     .populate('approvedRejectedBy', 'name role');

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Leave request updated successfully',
      data: leaveRequest
    });
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leave request',
      error: error.message
    });
  }
};

// Delete leave request
const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const leaveRequest = await LeaveRequest.findByIdAndDelete(id);

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Leave request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete leave request',
      error: error.message
    });
  }
};

// Get count of pending leave requests
const getPendingLeaveRequestCount = async (req, res) => {
  try {
    // Count case-insensitively to handle any legacy values like 'PENDING'
    const count = await LeaveRequest.countDocuments({ status: { $regex: /^pending$/i } });
    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error counting pending leave requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get pending leave request count',
      error: error.message
    });
  }
};

// Get leave requests by staff ID
const getLeaveRequestsByStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    
    const leaveRequests = await LeaveRequest.find({ staffID: staffId })
      .populate('staffID', 'name role gmail phone')
      .populate('approvedRejectedBy', 'name role')
      .sort({ requestedDate: -1 });

    res.status(200).json({
      success: true,
      count: leaveRequests.length,
      data: leaveRequests
    });
  } catch (error) {
    console.error('Error fetching staff leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff leave requests',
      error: error.message
    });
  }
};

// Update leave request status (for admin approval/rejection)
const updateLeaveRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedRejectedBy, adminComments } = req.body;

    const updateData = {
      status,
      adminComments: adminComments || '',
      approvedRejectedDate: new Date()
    };

    // Only set approvedRejectedBy if provided and valid
    if (approvedRejectedBy) {
      updateData.approvedRejectedBy = approvedRejectedBy;
    }

    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('staffID', 'name role gmail phone')
     .populate('approvedRejectedBy', 'name role');

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: leaveRequest
    });
  } catch (error) {
    console.error('Error updating leave request status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leave request status',
      error: error.message
    });
  }
};

module.exports = {
  createLeaveRequest,
  getAllLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  deleteLeaveRequest,
  getLeaveRequestsByStaff,
  updateLeaveRequestStatus,
  getPendingLeaveRequestCount
};
