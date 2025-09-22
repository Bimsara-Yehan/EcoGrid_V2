const express = require('express');
const router = express.Router();
const CompostingStation = require('../models/CompostingStation');
const CompostStation = require('../models/CompostStation');
const auth = require('../middleware/auth');

// @route   GET /api/composting/stations
// @desc    Get all composting stations
// @access  Public
router.get('/stations', async (req, res) => {
    try {
        const { lat, lng, maxDistance = 100, status, area } = req.query;
        
        let query = { isActive: true };
        
        if (status) {
            query.status = status;
        }
        
        if (area) {
            query['location.area'] = new RegExp(area, 'i');
        }

        // Combine legacy composting stations and simple compost stations
        const stationsLegacy = await CompostingStation.find(query)
            .populate('manager', 'name email phone')
            .sort({ averageRating: -1, createdAt: -1 });

        const stationsSimple = await CompostStation.find({ isActive: true }).sort({ createdAt: -1 });

        // Normalize legacy stations to ensure they have required properties
        const normalizedLegacy = stationsLegacy.map(station => ({
            ...station.toObject(),
            operatingHours: station.operatingHours || {},
            facilities: station.facilities || [],
            contact: station.contact || {}
        }));

        // Normalize simple stations to match legacy shape minimally
        const simpleNormalized = stationsSimple.map(s => ({
            _id: s._id,
            name: s.name,
            description: '',
            location: {
                address: s.location.address,
                coordinates: { latitude: s.location.lat, longitude: s.location.lng },
                area: ''
            },
            capacity: 0,
            currentLoad: 0,
            operatingHours: {},
            facilities: [],
            contact: {},
            status: 'operational',
            isActive: s.isActive,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt
        }));

        const stations = [...normalizedLegacy, ...simpleNormalized];

        // If coordinates provided, calculate distances and filter
        if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);
            const maxDist = parseFloat(maxDistance);

            const toObjectSafe = (s) => (typeof s.toObject === 'function' ? s.toObject() : s);
            const getLat = (s) => s?.location?.coordinates?.latitude ?? s?.location?.lat;
            const getLng = (s) => s?.location?.coordinates?.longitude ?? s?.location?.lng;
            const calcDistance = (aLat, aLng, bLat, bLng) => {
                const R = 6371;
                const dLat = (bLat - aLat) * Math.PI / 180;
                const dLng = (bLng - aLng) * Math.PI / 180;
                const lat1 = aLat * Math.PI / 180;
                const lat2 = bLat * Math.PI / 180;
                const h = Math.sin(dLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng/2)**2;
                return Math.round((2 * R * Math.asin(Math.sqrt(h))) * 100) / 100;
            };

            const stationsWithDistance = stations
                .map(s => {
                    const obj = toObjectSafe(s);
                    const sLat = getLat(obj);
                    const sLng = getLng(obj);
                    const distance = (typeof sLat === 'number' && typeof sLng === 'number')
                        ? calcDistance(userLat, userLng, sLat, sLng)
                        : null;
                    const isOpen = typeof s.isCurrentlyOpen === 'function' ? s.isCurrentlyOpen() : false;
                    return { ...obj, distance, isOpen };
                })
                .filter(station => station.distance !== null && station.distance <= maxDist)
                .sort((a, b) => a.distance - b.distance);

            return res.json(stationsWithDistance);
        }

        // Add isOpen status for all stations
        const toObjectSafe = (s) => (typeof s.toObject === 'function' ? s.toObject() : s);
        const stationsWithStatus = stations.map(station => ({
            ...toObjectSafe(station),
            isOpen: typeof station.isCurrentlyOpen === 'function' ? station.isCurrentlyOpen() : false
        }));

        res.json(stationsWithStatus);
    } catch (error) {
        console.error('Error fetching composting stations:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/composting/stations/:id
// @desc    Get specific composting station
// @access  Public
router.get('/stations/:id', async (req, res) => {
    try {
        const station = await CompostingStation.findById(req.params.id)
            .populate('manager', 'name email phone')
            .populate('ratings.user', 'name');

        if (!station) {
            return res.status(404).json({ message: 'Composting station not found' });
        }

        const stationWithStatus = {
            ...station.toObject(),
            isOpen: station.isCurrentlyOpen()
        };

        res.json(stationWithStatus);
    } catch (error) {
        console.error('Error fetching composting station:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/composting/stations
// @desc    Create new composting station
// @access  Private (Admin, Manager)
router.post('/stations', auth, async (req, res) => {
    try {
        if (!['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Admin or Manager role required.' });
        }

        const {
            name,
            description,
            location,
            capacity,
            operatingHours,
            contact,
            facilities,
            managerId
        } = req.body;

        const station = new CompostingStation({
            name,
            description,
            location,
            capacity,
            operatingHours,
            contact,
            facilities: facilities || [],
            manager: managerId
        });

        await station.save();
        await station.populate('manager', 'name email phone');

        res.status(201).json(station);
    } catch (error) {
        console.error('Error creating composting station:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/composting/stations/:id
// @desc    Update composting station
// @access  Private (Admin, Manager)
router.put('/stations/:id', auth, async (req, res) => {
    try {
        if (!['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Admin or Manager role required.' });
        }

        const station = await CompostingStation.findById(req.params.id);
        if (!station) {
            return res.status(404).json({ message: 'Composting station not found' });
        }

        const updateFields = req.body;
        Object.keys(updateFields).forEach(key => {
            if (updateFields[key] !== undefined) {
                station[key] = updateFields[key];
            }
        });

        await station.save();
        await station.populate('manager', 'name email phone');

        res.json(station);
    } catch (error) {
        console.error('Error updating composting station:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/composting/stations/:id/rating
// @desc    Add rating to composting station
// @access  Private
router.post('/stations/:id/rating', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const station = await CompostingStation.findById(req.params.id);
        if (!station) {
            return res.status(404).json({ message: 'Composting station not found' });
        }

        // Check if user already rated this station
        const existingRating = station.ratings.find(r => r.user.toString() === req.user.id);
        if (existingRating) {
            return res.status(400).json({ message: 'You have already rated this station' });
        }

        station.ratings.push({
            user: req.user.id,
            rating,
            comment: comment || ''
        });

        await station.save();

        res.json({ message: 'Rating added successfully', averageRating: station.averageRating });
    } catch (error) {
        console.error('Error adding rating:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/composting/areas
// @desc    Get all areas with composting stations
// @access  Public
router.get('/areas', async (req, res) => {
    try {
        const areas = await CompostingStation.distinct('location.area', { isActive: true });
        res.json(areas.sort());
    } catch (error) {
        console.error('Error fetching areas:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/composting/stats
// @desc    Get composting statistics
// @access  Public
router.get('/stats', async (req, res) => {
    try {
        const totalStations = await CompostingStation.countDocuments({ isActive: true });
        const operationalStations = await CompostingStation.countDocuments({ 
            isActive: true, 
            status: 'operational' 
        });
        
        const avgRating = await CompostingStation.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, avgRating: { $avg: '$averageRating' } } }
        ]);

        const facilitiesCount = await CompostingStation.aggregate([
            { $match: { isActive: true } },
            { $unwind: '$facilities' },
            { $group: { _id: '$facilities', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            totalStations,
            operationalStations,
            averageRating: avgRating[0]?.avgRating || 0,
            facilitiesCount
        });
    } catch (error) {
        console.error('Error fetching composting stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/composting/stations/:id
// @desc    Delete composting station
// @access  Private (Admin, Manager)
router.delete('/stations/:id', auth, async (req, res) => {
    try {
        if (!['Admin', 'Manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Admin or Manager role required.' });
        }

        const station = await CompostingStation.findById(req.params.id);
        if (!station) {
            return res.status(404).json({ message: 'Composting station not found' });
        }

        station.isActive = false;
        await station.save();

        res.json({ message: 'Composting station deactivated successfully' });
    } catch (error) {
        console.error('Error deleting composting station:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;










