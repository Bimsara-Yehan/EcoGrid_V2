const express = require('express');
const router = express.Router();
const CommunityEvent = require('../models/CommunityEvent');

// @route   GET /api/community-events
// @desc    Get all active community events
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { status, limit = 10 } = req.query;
        
        let query = { isActive: true };
        
        if (status) {
            query.status = status;
        }
        
        const events = await CommunityEvent.find(query)
            .sort({ eventDate: 1 })
            .limit(parseInt(limit));
            
        res.json(events);
    } catch (error) {
        console.error('Error fetching community events:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/community-events/:id
// @desc    Get specific community event
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const event = await CommunityEvent.findById(req.params.id);
        
        if (!event || !event.isActive) {
            return res.status(404).json({ message: 'Community event not found' });
        }
        
        res.json(event);
    } catch (error) {
        console.error('Error fetching community event:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/community-events
// @desc    Create new community event
// @access  Private (Admin, Manager)
router.post('/', async (req, res) => {
    try {
        const {
            title,
            description,
            imageUrl,
            eventDate,
            location,
            organizer,
            maxParticipants
        } = req.body;

        const event = new CommunityEvent({
            title,
            description,
            imageUrl,
            eventDate,
            location,
            organizer,
            maxParticipants
        });

        await event.save();
        res.status(201).json(event);
    } catch (error) {
        console.error('Error creating community event:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/community-events/:id
// @desc    Update community event
// @access  Private (Admin, Manager)
router.put('/:id', async (req, res) => {
    try {
        const event = await CommunityEvent.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Community event not found' });
        }

        const updateFields = req.body;
        Object.keys(updateFields).forEach(key => {
            if (updateFields[key] !== undefined) {
                event[key] = updateFields[key];
            }
        });

        await event.save();
        res.json(event);
    } catch (error) {
        console.error('Error updating community event:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/community-events/:id
// @desc    Delete community event
// @access  Private (Admin, Manager)
router.delete('/:id', async (req, res) => {
    try {
        const event = await CommunityEvent.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Community event not found' });
        }

        event.isActive = false;
        await event.save();

        res.json({ message: 'Community event deactivated successfully' });
    } catch (error) {
        console.error('Error deleting community event:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;



