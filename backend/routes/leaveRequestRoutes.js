const express = require('express');
const router = express.Router();
const {
  createLeaveRequest,
  getAllLeaveRequests,
  getLeaveRequestById,
  updateLeaveRequest,
  deleteLeaveRequest,
  getLeaveRequestsByStaff,
  updateLeaveRequestStatus,
  getPendingLeaveRequestCount
} = require('../controllers/leaveRequestController');

// Create new leave request
router.post('/', createLeaveRequest);

// Get pending count (specific route)
router.get('/pending/count', getPendingLeaveRequestCount);

// Get all leave requests
router.get('/', getAllLeaveRequests);

// IMPORTANT: Place parameterized routes AFTER more specific ones to avoid route capture
// Get leave requests by staff ID (must be before `/:id`)
router.get('/staff/:staffId', getLeaveRequestsByStaff);

// Get single leave request by ID
router.get('/:id', getLeaveRequestById);

// Update leave request
router.put('/:id', updateLeaveRequest);

// Delete leave request
router.delete('/:id', deleteLeaveRequest);

// Update leave request status (for admin approval/rejection)
router.patch('/:id/status', updateLeaveRequestStatus);

module.exports = router;
