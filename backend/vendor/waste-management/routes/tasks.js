const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// File upload setup for task attachments
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/tasks'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'task-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images, documents, and PDFs
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, documents, and PDFs are allowed'));
        }
    }
});

// @route   GET /api/tasks
// @desc    Get tasks for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { status, category, priority, page = 1, limit = 10 } = req.query;
        
        // Build filter object
        const filter = { assignedTo: req.user.id };
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        
        const tasks = await Task.find(filter)
            .populate('assignedBy', 'name email role')
            .populate('approvedBy', 'name email role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Task.countDocuments(filter);
        
        res.json({
            tasks,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/tasks/admin
// @desc    Get all tasks (Admin only)
// @access  Private (Admin only)
router.get('/admin', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        const { status, category, priority, assignedTo, page = 1, limit = 10 } = req.query;
        
        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (assignedTo) filter.assignedTo = assignedTo;
        
        const tasks = await Task.find(filter)
            .populate('assignedTo', 'name email role')
            .populate('assignedBy', 'name email role')
            .populate('approvedBy', 'name email role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await Task.countDocuments(filter);
        
        res.json({
            tasks,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get admin tasks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/tasks
// @desc    Create a new task (Admin only)
// @access  Private (Admin only)
router.post('/', [
    auth,
    upload.array('attachments', 5), // Allow up to 5 attachments
    body('title', 'Title is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
    body('assignedTo', 'Assigned user is required').not().isEmpty(),
    body('dueDate', 'Due date is required').not().isEmpty(),
    body('priority', 'Priority must be Low, Medium, High, or Critical').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
    body('category', 'Category must be valid').optional().isIn(['Waste Collection', 'Recycling', 'Maintenance', 'Administrative', 'Emergency', 'Other']),
    body('ecopoints', 'Ecopoints must be a positive number').optional().isInt({ min: 0 })
], async (req, res) => {
    try {
        // Check if user is admin
        if (!['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { title, description, assignedTo, dueDate, priority, category, ecopoints } = req.body;
        
        // Check if assigned user exists
        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser) {
            return res.status(400).json({ message: 'Assigned user not found' });
        }
        
        // Process attachments
        const attachments = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            url: `/uploads/tasks/${file.filename}`
        })) : [];
        
        const task = new Task({
            title,
            description,
            assignedTo,
            assignedBy: req.user.id,
            dueDate: new Date(dueDate),
            priority: priority || 'Medium',
            category: category || 'Waste Collection',
            ecopoints: ecopoints || 0,
            attachments
        });
        
        await task.save();
        
        // Populate the task with user details
        await task.populate([
            { path: 'assignedTo', select: 'name email role' },
            { path: 'assignedBy', select: 'name email role' }
        ]);
        
        res.status(201).json(task);
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/tasks/:id/complete
// @desc    Mark task as completed
// @access  Private
router.put('/:id/complete', [
    auth,
    body('completionNotes', 'Completion notes are required').not().isEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { completionNotes } = req.body;
        
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        // Check if user is assigned to this task
        if (task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied. You can only complete tasks assigned to you.' });
        }
        
        // Check if task is not already completed
        if (task.status === 'Completed') {
            return res.status(400).json({ message: 'Task is already completed' });
        }
        
        task.status = 'Completed';
        task.completedAt = new Date();
        
        // Add completion note to notes array
        task.notes.push({
            content: completionNotes,
            author: req.user.id
        });
        
        await task.save();
        
        // Populate the task with user details
        await task.populate([
            { path: 'assignedTo', select: 'name email role' },
            { path: 'assignedBy', select: 'name email role' }
        ]);
        
        res.json(task);
    } catch (error) {
        console.error('Complete task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/tasks/:id/approve
// @desc    Approve or reject a completed task (Admin only)
// @access  Private (Admin only)
router.put('/:id/approve', [
    auth,
    body('action', 'Action must be approve or reject').isIn(['approve', 'reject']),
    body('adminNotes', 'Admin notes are required').not().isEmpty()
], async (req, res) => {
    try {
        // Check if user is admin
        if (!['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { action, adminNotes } = req.body;
        
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        // Check if task is completed
        if (task.status !== 'completed') {
            return res.status(400).json({ message: 'Task must be completed before approval' });
        }
        
        task.status = action === 'approve' ? 'approved' : 'rejected';
        task.approvedAt = new Date();
        task.approvedBy = req.user.id;
        task.adminNotes = adminNotes;
        
        await task.save();
        
        // If approved, add ecopoints to user
        if (action === 'approve' && task.ecopoints > 0) {
            await User.findByIdAndUpdate(task.assignedTo, {
                $inc: { ecopoints: task.ecopoints }
            });
        }
        
        // Populate the task with user details
        await task.populate([
            { path: 'assignedTo', select: 'name email role' },
            { path: 'assignedBy', select: 'name email role' },
            { path: 'approvedBy', select: 'name email role' }
        ]);
        
        res.json(task);
    } catch (error) {
        console.error('Approve task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/tasks/:id
// @desc    Get a specific task
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name email role')
            .populate('assignedBy', 'name email role')
            .populate('approvedBy', 'name email role');
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        // Check if user has access to this task
        if (task.assignedTo._id.toString() !== req.user.id && 
            !['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        res.json(task);
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task (Admin only)
// @access  Private (Admin only)
router.put('/:id', [
    auth,
    body('title', 'Title is required').optional().not().isEmpty(),
    body('description', 'Description is required').optional().not().isEmpty(),
    body('priority', 'Priority must be Low, Medium, High, or Critical').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
    body('category', 'Category must be valid').optional().isIn(['Waste Collection', 'Recycling', 'Maintenance', 'Administrative', 'Emergency', 'Other']),
    body('ecopoints', 'Ecopoints must be a positive number').optional().isInt({ min: 0 })
], async (req, res) => {
    try {
        // Check if user is admin
        if (!['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        // Update allowed fields
        const allowedUpdates = ['title', 'description', 'dueDate', 'priority', 'category', 'ecopoints'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                task[field] = req.body[field];
            }
        });
        
        await task.save();
        
        // Populate the task with user details
        await task.populate([
            { path: 'assignedTo', select: 'name email role' },
            { path: 'assignedBy', select: 'name email role' }
        ]);
        
        res.json(task);
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task (Admin only)
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (!['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

