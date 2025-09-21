const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Incinerator = require('../models/Incinerator');
const WasteProcessing = require('../models/WasteProcessing');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/incinerator/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow images and documents
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and documents are allowed'));
        }
    }
});

// Middleware to check if user is incinerator operator
const isIncineratorOperator = (req, res, next) => {
    if (req.user.role !== 'Incinerator') {
        return res.status(403).json({ message: 'Access denied. Incinerator operator role required.' });
    }
    next();
};

// @route   GET /api/incinerator/status
// @desc    Get all incinerators status
// @access  Private (Incinerator, Admin, Manager)
router.get('/status', auth, async (req, res) => {
    try {
        const allowedRoles = ['Incinerator', 'Admin', 'Manager'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const incinerators = await Incinerator.find({ isActive: true })
            .populate('operator', 'name email employeeId')
            .sort({ createdAt: -1 });

        res.json(incinerators);
    } catch (error) {
        console.error('Error fetching incinerator status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/incinerator/:id
// @desc    Get specific incinerator details
// @access  Private (Incinerator, Admin, Manager)
router.get('/:id', auth, async (req, res) => {
    try {
        const allowedRoles = ['Incinerator', 'Admin', 'Manager'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const incinerator = await Incinerator.findById(req.params.id)
            .populate('operator', 'name email employeeId');

        if (!incinerator) {
            return res.status(404).json({ message: 'Incinerator not found' });
        }

        res.json(incinerator);
    } catch (error) {
        console.error('Error fetching incinerator:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/incinerator
// @desc    Create new incinerator
// @access  Private (Admin, Manager)
router.post('/', auth, async (req, res) => {
    try {
        if (!['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Admin or Manager role required.' });
        }

        const {
            name,
            location,
            capacity,
            optimalTemperature,
            maxTemperature,
            operatorId
        } = req.body;

        // Validate operator
        const operator = await User.findById(operatorId);
        if (!operator || operator.role !== 'Incinerator') {
            return res.status(400).json({ message: 'Invalid operator. Must be an Incinerator user.' });
        }

        const incinerator = new Incinerator({
            name,
            location,
            capacity,
            temperature: {
                optimal: optimalTemperature,
                max: maxTemperature
            },
            operator: operatorId
        });

        await incinerator.save();
        await incinerator.populate('operator', 'name email employeeId');

        res.status(201).json(incinerator);
    } catch (error) {
        console.error('Error creating incinerator:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/incinerator/:id/status
// @desc    Update incinerator status and metrics
// @access  Private (Incinerator, Admin, Manager)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const allowedRoles = ['Incinerator', 'Admin', 'Manager'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const {
            status,
            currentLoad,
            temperature,
            emissions,
            efficiency
        } = req.body;

        const incinerator = await Incinerator.findById(req.params.id);
        if (!incinerator) {
            return res.status(404).json({ message: 'Incinerator not found' });
        }

        // Update fields
        if (status) incinerator.status = status;
        if (currentLoad !== undefined) incinerator.currentLoad = currentLoad;
        if (temperature) incinerator.temperature.current = temperature;
        if (emissions) {
            if (emissions.co2 !== undefined) incinerator.emissions.co2 = emissions.co2;
            if (emissions.nox !== undefined) incinerator.emissions.nox = emissions.nox;
            if (emissions.so2 !== undefined) incinerator.emissions.so2 = emissions.so2;
            if (emissions.particulate !== undefined) incinerator.emissions.particulate = emissions.particulate;
        }
        if (efficiency !== undefined) incinerator.efficiency = efficiency;

        await incinerator.save();

        res.json(incinerator);
    } catch (error) {
        console.error('Error updating incinerator status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/incinerator/processing/start
// @desc    Start waste processing
// @access  Private (Incinerator)
router.post('/processing/start', auth, isIncineratorOperator, async (req, res) => {
    try {
        const {
            incineratorId,
            wasteType,
            quantity,
            unit,
            startTemperature,
            notes
        } = req.body;

        const incinerator = await Incinerator.findById(incineratorId);
        if (!incinerator) {
            return res.status(404).json({ message: 'Incinerator not found' });
        }

        if (incinerator.status !== 'operational') {
            return res.status(400).json({ message: 'Incinerator is not operational' });
        }

        const processing = new WasteProcessing({
            incinerator: incineratorId,
            operator: req.user.id,
            wasteType,
            quantity,
            unit,
            processingStartTime: new Date(),
            temperature: {
                start: startTemperature
            },
            notes
        });

        await processing.save();

        // Update incinerator current load
        incinerator.currentLoad += quantity;
        await incinerator.save();

        res.status(201).json(processing);
    } catch (error) {
        console.error('Error starting waste processing:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/incinerator/processing/:id/update
// @desc    Update processing status
// @access  Private (Incinerator)
router.put('/processing/:id/update', auth, isIncineratorOperator, async (req, res) => {
    try {
        const {
            status,
            temperature,
            emissions,
            ashProduced,
            energyGenerated,
            notes
        } = req.body;

        const processing = await WasteProcessing.findById(req.params.id);
        if (!processing) {
            return res.status(404).json({ message: 'Processing record not found' });
        }

        // Update fields
        if (status) processing.status = status;
        if (temperature) {
            if (temperature.peak !== undefined) processing.temperature.peak = temperature.peak;
            if (temperature.end !== undefined) processing.temperature.end = temperature.end;
        }
        if (emissions) {
            if (emissions.co2 !== undefined) processing.emissions.co2 = emissions.co2;
            if (emissions.nox !== undefined) processing.emissions.nox = emissions.nox;
            if (emissions.so2 !== undefined) processing.emissions.so2 = emissions.so2;
            if (emissions.particulate !== undefined) processing.emissions.particulate = emissions.particulate;
        }
        if (ashProduced !== undefined) processing.ashProduced = ashProduced;
        if (energyGenerated !== undefined) processing.energyGenerated = energyGenerated;
        if (notes) processing.notes = notes;

        // If completing processing, set end time
        if (status === 'completed') {
            processing.processingEndTime = new Date();
            processing.efficiency = processing.calculateEfficiency();
        }

        await processing.save();

        res.json(processing);
    } catch (error) {
        console.error('Error updating processing:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/incinerator/processing
// @desc    Get processing records
// @access  Private (Incinerator, Admin, Manager)
router.get('/processing', auth, async (req, res) => {
    try {
        const allowedRoles = ['Incinerator', 'Admin', 'Manager'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { page = 1, limit = 10, status, wasteType, incineratorId } = req.query;
        const query = {};

        if (status) query.status = status;
        if (wasteType) query.wasteType = wasteType;
        if (incineratorId) query.incinerator = incineratorId;

        const processing = await WasteProcessing.find(query)
            .populate('incinerator', 'name location')
            .populate('operator', 'name email employeeId')
            .populate('qualityCheck.checkedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await WasteProcessing.countDocuments(query);

        res.json({
            processing,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching processing records:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/incinerator/processing/:id/quality-check
// @desc    Perform quality check on processing
// @access  Private (Incinerator, Admin, Manager)
router.post('/processing/:id/quality-check', auth, async (req, res) => {
    try {
        const allowedRoles = ['Incinerator', 'Admin', 'Manager'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { passed, issues } = req.body;

        const processing = await WasteProcessing.findById(req.params.id);
        if (!processing) {
            return res.status(404).json({ message: 'Processing record not found' });
        }

        processing.qualityCheck = {
            performed: true,
            passed,
            issues: issues || [],
            checkedBy: req.user.id,
            checkedAt: new Date()
        };

        await processing.save();

        res.json(processing);
    } catch (error) {
        console.error('Error performing quality check:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/incinerator/processing/:id/upload
// @desc    Upload documents for processing record
// @access  Private (Incinerator)
router.post('/processing/:id/upload', auth, isIncineratorOperator, upload.array('files', 5), async (req, res) => {
    try {
        const processing = await WasteProcessing.findById(req.params.id);
        if (!processing) {
            return res.status(404).json({ message: 'Processing record not found' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const attachments = req.files.map(file => ({
            filename: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
        }));

        processing.attachments.push(...attachments);
        await processing.save();

        res.json({ message: 'Files uploaded successfully', attachments });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/incinerator/analytics/dashboard
// @desc    Get incinerator analytics for dashboard
// @access  Private (Incinerator, Admin, Manager)
router.get('/analytics/dashboard', auth, async (req, res) => {
    try {
        const allowedRoles = ['Incinerator', 'Admin', 'Manager'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { period = '7d' } = req.query;
        let startDate = new Date();

        // Calculate start date based on period
        switch (period) {
            case '1d':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
        }

        // Get processing statistics
        const totalProcessing = await WasteProcessing.countDocuments({
            createdAt: { $gte: startDate }
        });

        const completedProcessing = await WasteProcessing.countDocuments({
            status: 'completed',
            createdAt: { $gte: startDate }
        });

        const totalWasteProcessed = await WasteProcessing.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$quantity' }
                }
            }
        ]);

        const totalEnergyGenerated = await WasteProcessing.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$energyGenerated' }
                }
            }
        ]);

        // Get incinerator status
        const incinerators = await Incinerator.find({ isActive: true });
        const operationalIncinerators = incinerators.filter(inc => inc.status === 'operational').length;

        res.json({
            period,
            totalProcessing,
            completedProcessing,
            totalWasteProcessed: totalWasteProcessed[0]?.total || 0,
            totalEnergyGenerated: totalEnergyGenerated[0]?.total || 0,
            totalIncinerators: incinerators.length,
            operationalIncinerators,
            efficiency: completedProcessing > 0 ? Math.round((completedProcessing / totalProcessing) * 100) : 0
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;











