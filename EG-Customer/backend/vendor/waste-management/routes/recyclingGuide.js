const express = require('express');
const { RecyclingCategory, RecyclingTip } = require('../models/RecyclingGuide');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/recycling-guide/categories
// @desc    Get all recycling categories
// @access  Public
router.get('/categories', async (req, res) => {
    try {
        const { language = 'en' } = req.query;
        const categories = await RecyclingCategory.find({ 
            language, 
            isActive: true 
        }).sort({ name: 1 });
        
        res.json(categories);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/recycling-guide/categories/:id
// @desc    Get specific recycling category
// @access  Public
router.get('/categories/:id', async (req, res) => {
    try {
        const category = await RecyclingCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        res.json(category);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/recycling-guide/tips
// @desc    Get recycling tips
// @access  Public
router.get('/tips', async (req, res) => {
    try {
        const { category, language = 'en' } = req.query;
        let query = { language, isActive: true };
        
        if (category) {
            query.category = category;
        }
        
        const tips = await RecyclingTip.find(query)
            .sort({ createdAt: -1 })
            .limit(20);
        
        res.json(tips);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/recycling-guide/tips/:id
// @desc    Get specific recycling tip
// @access  Public
router.get('/tips/:id', async (req, res) => {
    try {
        const tip = await RecyclingTip.findById(req.params.id);
        if (!tip) {
            return res.status(404).json({ message: 'Tip not found' });
        }
        
        res.json(tip);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/recycling-guide/search
// @desc    Search recycling guide
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { q, language = 'en' } = req.query;
        
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        
        const searchRegex = new RegExp(q, 'i');
        
        const categories = await RecyclingCategory.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex },
                { items: searchRegex }
            ],
            language,
            isActive: true
        });
        
        const tips = await RecyclingTip.find({
            $or: [
                { title: searchRegex },
                { description: searchRegex }
            ],
            language,
            isActive: true
        });
        
        res.json({
            categories,
            tips
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/recycling-guide/random-tip
// @desc    Get a random recycling tip
// @access  Public
router.get('/random-tip', async (req, res) => {
    try {
        const { language = 'en' } = req.query;
        
        const tip = await RecyclingTip.aggregate([
            { $match: { language, isActive: true } },
            { $sample: { size: 1 } }
        ]);
        
        if (tip.length === 0) {
            return res.status(404).json({ message: 'No tips found' });
        }
        
        res.json(tip[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/recycling-guide/categories
// @desc    Create new recycling category (Admin only)
// @access  Private
router.post('/categories', auth, async (req, res) => {
    try {
        const { name, description, items, tips, icon, language } = req.body;
        
        // TODO: Add admin role check
        // if (!req.user.isAdmin) {
        //     return res.status(403).json({ message: 'Admin access required' });
        // }
        
        const category = new RecyclingCategory({
            name,
            description,
            items,
            tips,
            icon,
            language
        });
        
        await category.save();
        res.json(category);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/recycling-guide/tips
// @desc    Create new recycling tip (Admin only)
// @access  Private
router.post('/tips', auth, async (req, res) => {
    try {
        const { title, description, category, icon, language } = req.body;
        
        // TODO: Add admin role check
        // if (!req.user.isAdmin) {
        //     return res.status(403).json({ message: 'Admin access required' });
        // }
        
        const tip = new RecyclingTip({
            title,
            description,
            category,
            icon,
            language
        });
        
        await tip.save();
        res.json(tip);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

