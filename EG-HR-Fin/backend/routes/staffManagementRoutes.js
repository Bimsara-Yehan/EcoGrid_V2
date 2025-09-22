const express = require('express');
const router = express.Router();

// Import existing handlers from vendor code
const staffController = require('../vendor/staff-management/controllers/staffController');
const leaveRequestController = require('../vendor/staff-management/controllers/leaveRequestController');
const paymentController = require('../vendor/staff-management/controllers/paymentController');

// Staff Management Routes
router.get('/staff', staffController.getAllStaff);
router.get('/staff/:id', staffController.getStaffById);
router.post('/staff', staffController.createStaff);
router.put('/staff/:id', staffController.updateStaff);
router.delete('/staff/:id', staffController.deleteStaff);

// Leave Request Routes
router.get('/leaverequests', leaveRequestController.getAllLeaveRequests);
router.get('/leaverequests/:id', leaveRequestController.getLeaveRequestById);
router.post('/leaverequests', leaveRequestController.createLeaveRequest);
router.put('/leaverequests/:id', leaveRequestController.updateLeaveRequest);
router.delete('/leaverequests/:id', leaveRequestController.deleteLeaveRequest);
router.patch('/leaverequests/:id/status', leaveRequestController.updateLeaveRequestStatus);
router.get('/leaverequests/pending/count', leaveRequestController.getPendingLeaveRequestCount);
router.get('/leaverequests/staff/:staffId', leaveRequestController.getLeaveRequestsByStaff);

// Payment Routes
router.get('/payments', paymentController.getAllPayments);
router.get('/payments/:id', paymentController.getPaymentById);
router.post('/payments', paymentController.createPayment);
router.put('/payments/:id', paymentController.updatePayment);
router.delete('/payments/:id', paymentController.deletePayment);

module.exports = router;
