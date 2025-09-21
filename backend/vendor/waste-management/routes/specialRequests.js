const express = require('express');
const { body, validationResult } = require('express-validator');
const SpecialRequest = require('../models/SpecialRequest');
const Customer = require('../models/Customer');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/special-requests
// @desc    Get all special requests for a customer
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Find customer by user ID
        const customer = await Customer.findOne({ userId: req.user.id });
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                error: { 
                    code: 'CUSTOMER_NOT_FOUND', 
                    message: 'Customer profile not found' 
                } 
            });
        }

        const requests = await SpecialRequest.find({ customerId: customer._id })
            .sort({ createdAt: -1 })
            .populate('assignedDriver', 'name email');

        // Populate customer details for each request
        for (let request of requests) {
            await request.populateCustomerDetails();
        }

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Get special requests error:', error);
        res.status(500).json({ 
            success: false, 
            error: { 
                code: 'SERVER_ERROR', 
                message: 'Server error' 
            } 
        });
    }
});

// @route   POST /api/special-requests
// @desc    Create a new special request
// @access  Private
router.post('/', [
    auth,
    body('wasteType', 'Waste type is required').not().isEmpty(),
    body('quantity', 'Quantity is required').not().isEmpty(),
    body('preferredDate', 'Preferred date is required').isISO8601(),
    body('preferredTime', 'Preferred time is required').not().isEmpty(),
    body('description').optional().isLength({ max: 1000 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                error: { 
                    code: 'VALIDATION_ERROR', 
                    message: 'Validation failed', 
                    details: errors.array() 
                } 
            });
        }

        // Find customer by user ID
        const customer = await Customer.findOne({ userId: req.user.id });
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                error: { 
                    code: 'CUSTOMER_NOT_FOUND', 
                    message: 'Customer profile not found' 
                } 
            });
        }

        const { wasteType, quantity, preferredDate, preferredTime, description } = req.body;

        const specialRequest = new SpecialRequest({
            customerId: customer._id,
            wasteType,
            quantity,
            preferredDate: new Date(preferredDate),
            preferredTime,
            description: description || ''
        });

        await specialRequest.save();
        await specialRequest.populateCustomerDetails();

        res.status(201).json({
            success: true,
            data: specialRequest,
            message: 'Special request submitted successfully'
        });
    } catch (error) {
        console.error('Create special request error:', error);
        res.status(500).json({ 
            success: false, 
            error: { 
                code: 'SERVER_ERROR', 
                message: 'Server error' 
            } 
        });
    }
});

// @route   GET /api/special-requests/:id
// @desc    Get a specific special request
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        // Find customer by user ID
        const customer = await Customer.findOne({ userId: req.user.id });
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                error: { 
                    code: 'CUSTOMER_NOT_FOUND', 
                    message: 'Customer profile not found' 
                } 
            });
        }

        const request = await SpecialRequest.findOne({ 
            _id: req.params.id, 
            customerId: customer._id 
        }).populate('assignedDriver', 'name email');

        if (!request) {
            return res.status(404).json({ 
                success: false, 
                error: { 
                    code: 'REQUEST_NOT_FOUND', 
                    message: 'Special request not found' 
                } 
            });
        }

        await request.populateCustomerDetails();

        res.json({
            success: true,
            data: request
        });
    } catch (error) {
        console.error('Get special request error:', error);
        res.status(500).json({ 
            success: false, 
            error: { 
                code: 'SERVER_ERROR', 
                message: 'Server error' 
            } 
        });
    }
});

// @route   PUT /api/special-requests/:id
// @desc    Update a special request (only if pending)
// @access  Private
router.put('/:id', [
    auth,
    body('wasteType').optional().not().isEmpty(),
    body('quantity').optional().not().isEmpty(),
    body('preferredDate').optional().isISO8601(),
    body('preferredTime').optional().not().isEmpty(),
    body('description').optional().isLength({ max: 1000 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                error: { 
                    code: 'VALIDATION_ERROR', 
                    message: 'Validation failed', 
                    details: errors.array() 
                } 
            });
        }

        // Find customer by user ID
        const customer = await Customer.findOne({ userId: req.user.id });
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                error: { 
                    code: 'CUSTOMER_NOT_FOUND', 
                    message: 'Customer profile not found' 
                } 
            });
        }

        const request = await SpecialRequest.findOne({ 
            _id: req.params.id, 
            customerId: customer._id 
        });

        if (!request) {
            return res.status(404).json({ 
                success: false, 
                error: { 
                    code: 'REQUEST_NOT_FOUND', 
                    message: 'Special request not found' 
                } 
            });
        }

        // Only allow updates if request is pending
        if (request.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                error: { 
                    code: 'REQUEST_NOT_EDITABLE', 
                    message: 'Only pending requests can be updated' 
                } 
            });
        }

        const { wasteType, quantity, preferredDate, preferredTime, description } = req.body;

        // Update fields
        if (wasteType) request.wasteType = wasteType;
        if (quantity) request.quantity = quantity;
        if (preferredDate) request.preferredDate = new Date(preferredDate);
        if (preferredTime) request.preferredTime = preferredTime;
        if (description !== undefined) request.description = description;

        await request.save();
        await request.populateCustomerDetails();

        res.json({
            success: true,
            data: request,
            message: 'Special request updated successfully'
        });
    } catch (error) {
        console.error('Update special request error:', error);
        res.status(500).json({ 
            success: false, 
            error: { 
                code: 'SERVER_ERROR', 
                message: 'Server error' 
            } 
        });
    }
});

// @route   DELETE /api/special-requests/:id
// @desc    Cancel a special request (only if pending or approved)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        // Find customer by user ID
        const customer = await Customer.findOne({ userId: req.user.id });
        if (!customer) {
            return res.status(404).json({ 
                success: false, 
                error: { 
                    code: 'CUSTOMER_NOT_FOUND', 
                    message: 'Customer profile not found' 
                } 
            });
        }

        const request = await SpecialRequest.findOne({ 
            _id: req.params.id, 
            customerId: customer._id 
        });

        if (!request) {
            return res.status(404).json({ 
                success: false, 
                error: { 
                    code: 'REQUEST_NOT_FOUND', 
                    message: 'Special request not found' 
                } 
            });
        }

        // Only allow cancellation if request is pending or approved
        if (!['pending', 'approved'].includes(request.status)) {
            return res.status(400).json({ 
                success: false, 
                error: { 
                    code: 'REQUEST_NOT_CANCELLABLE', 
                    message: 'Only pending or approved requests can be cancelled' 
                } 
            });
        }

        request.status = 'cancelled';
        await request.save();

        res.json({
            success: true,
            message: 'Special request cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel special request error:', error);
        res.status(500).json({ 
            success: false, 
            error: { 
                code: 'SERVER_ERROR', 
                message: 'Server error' 
            } 
        });
    }
});

// @route   GET /api/special-requests/admin/all
// @desc    Get all special requests (admin only)
// @access  Private (Admin/Manager)
router.get('/admin/all', auth, async (req, res) => {
    try {
        // Check if user is admin or manager
        if (!['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                error: { 
                    code: 'ACCESS_DENIED', 
                    message: 'Admin or Manager access required' 
                } 
            });
        }

        const { status, page = 1, limit = 10 } = req.query;
        const query = status ? { status } : {};

        const requests = await SpecialRequest.find(query)
            .populate('customerId', 'fullName phones addresses')
            .populate('assignedDriver', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Populate customer details for each request
        for (let request of requests) {
            await request.populateCustomerDetails();
        }

        const total = await SpecialRequest.countDocuments(query);

        res.json({
            success: true,
            data: requests,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get all special requests error:', error);
        res.status(500).json({ 
            success: false, 
            error: { 
                code: 'SERVER_ERROR', 
                message: 'Server error' 
            } 
        });
    }
});

module.exports = router;
