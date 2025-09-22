const express = require('express');
const { body, validationResult } = require('express-validator');
const WasteCollection = require('../models/WasteCollection');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/waste-collection
// @desc    Get all waste collections for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const collections = await WasteCollection.find({ userId: req.user.id })
            .sort({ scheduledDate: 1 });
        res.json(collections);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/waste-collection/upcoming
// @desc    Get upcoming waste collections
// @access  Private
router.get('/upcoming', auth, async (req, res) => {
    try {
        const upcoming = await WasteCollection.find({
            userId: req.user.id,
            status: { $in: ['SCHEDULED', 'IN_PROGRESS'] },
            scheduledDate: { $gte: new Date() }
        }).sort({ scheduledDate: 1 });
        
        res.json(upcoming);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/waste-collection/recent
// @desc    Get recent completed waste collections
// @access  Private
router.get('/recent', auth, async (req, res) => {
    try {
        const recent = await WasteCollection.find({
            userId: req.user.id,
            status: 'COMPLETED'
        })
        .sort({ completedDate: -1 })
        .limit(10);
        
        res.json(recent);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/waste-collection
// @desc    Schedule a new waste collection
// @access  Private
router.post('/', [
    auth,
    body('wasteType', 'Waste type is required').not().isEmpty(),
    body('scheduledDate', 'Scheduled date is required').isISO8601(),
    body('location', 'Location is required').not().isEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { wasteType, scheduledDate, notes, location, weight } = req.body;

        const collection = new WasteCollection({
            userId: req.user.id,
            wasteType,
            scheduledDate,
            notes,
            location,
            weight
        });

        await collection.save();
        res.json(collection);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/waste-collection/:id
// @desc    Update waste collection
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { wasteType, scheduledDate, notes, location, weight, status } = req.body;

        let collection = await WasteCollection.findById(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        // Check ownership
        if (collection.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Update fields
        if (wasteType) collection.wasteType = wasteType;
        if (scheduledDate) collection.scheduledDate = scheduledDate;
        if (notes !== undefined) collection.notes = notes;
        if (location) collection.location = location;
        if (weight !== undefined) collection.weight = weight;
        if (status) {
            collection.status = status;
            if (status === 'COMPLETED') {
                collection.completedDate = new Date();
            }
        }

        await collection.save();
        res.json(collection);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/waste-collection/:id
// @desc    Cancel waste collection
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const collection = await WasteCollection.findById(req.params.id);
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

        // Check ownership
        if (collection.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Only allow cancellation of scheduled collections
        if (collection.status !== 'SCHEDULED') {
            return res.status(400).json({ message: 'Can only cancel scheduled collections' });
        }

        collection.status = 'CANCELLED';
        await collection.save();

        res.json({ message: 'Collection cancelled successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/waste-collection/stats
// @desc    Get waste collection statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
    try {
        const totalCollections = await WasteCollection.countDocuments({ userId: req.user.id });
        const completedCollections = await WasteCollection.countDocuments({ 
            userId: req.user.id, 
            status: 'COMPLETED' 
        });
        const totalRecycled = await WasteCollection.aggregate([
            { $match: { userId: req.user.id, status: 'COMPLETED' } },
            { $group: { _id: null, total: { $sum: '$weight' } } }
        ]);

        const stats = {
            totalCollections,
            completedCollections,
            totalRecycled: totalRecycled[0]?.total || 0,
            currentStreak: 0 // TODO: Implement streak calculation
        };

        res.json(stats);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

