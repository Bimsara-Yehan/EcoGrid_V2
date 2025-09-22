const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

const router = express.Router();

// File upload setup for profile images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'profile-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// @route   GET /api/user-profile
// @desc    Get user profile
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');

        // Merge customer profile fields for client consumption
        let profileData = {};
        const customer = await Customer.findOne({ userId: user._id });
        if (customer) {
            profileData = {
                name: customer.fullName,
                phones: customer.phones,
                addresses: customer.addresses,
                preferences: customer.preferences,
                profileImageUrl: customer.profileImageUrl,
                hasCompletedOnboarding: customer.hasCompletedOnboarding
            };
        }

        res.json({
            ...user.toObject(),
            ...profileData,
            phone: (profileData.phones && profileData.phones[0]) || '',
            address: (profileData.addresses && profileData.addresses[0] && (profileData.addresses[0].addressLine || profileData.addresses[0].street)) || ''
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/user-profile
// @desc    Update user profile
// @access  Private
router.put('/', [
    auth,
    body('name', 'Name is required').not().isEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, phone, address } = req.body;

        // Load user, but do not allow editing email here
        const user = await User.findById(req.user.id).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update linked customer profile (source of name/phone/address)
        let customer = await Customer.findOne({ userId: user._id });
        if (!customer) {
            customer = new Customer({ userId: user._id, fullName: name });
        }

        if (typeof name === 'string' && name.trim()) {
            customer.fullName = name.trim();
        }

        if (typeof phone === 'string') {
            const trimmed = phone.trim();
            if (trimmed) {
                const phones = Array.isArray(customer.phones) ? customer.phones : [];
                if (phones.length > 0) {
                    phones[0] = trimmed; // Store as string
                } else {
                    phones.push(trimmed); // Store as string
                }
                customer.phones = phones;
            }
        }

        if (typeof address === 'string') {
            const trimmed = address.trim();
            const addresses = Array.isArray(customer.addresses) ? customer.addresses : [];
            if (trimmed) {
                if (addresses.length > 0) {
                    addresses[0] = {
                        label: trimmed,
                        addressLine: trimmed,
                        geo: addresses[0].geo || { type: 'Point', coordinates: [0, 0] },
                        zoneId: addresses[0].zoneId || null,
                        // Legacy fields for backward compatibility
                        street: trimmed,
                        city: addresses[0].city || 'Unknown',
                        state: addresses[0].state || 'Unknown',
                        zipCode: addresses[0].zipCode || '00000',
                        country: addresses[0].country || 'US',
                        isPrimary: true
                    };
                } else {
                    addresses.push({ 
                        label: trimmed, 
                        addressLine: trimmed,
                        geo: { type: 'Point', coordinates: [0, 0] },
                        zoneId: null,
                        // Legacy fields for backward compatibility
                        street: trimmed, 
                        city: 'Unknown', 
                        state: 'Unknown', 
                        zipCode: '00000', 
                        country: 'US', 
                        isPrimary: true 
                    });
                }
                customer.addresses = addresses;
            }
        }

        await customer.save();

        // Return merged view similar to /api/auth/me
        res.json({
            ...user.toObject(),
            name: customer.fullName,
            phones: customer.phones,
            addresses: customer.addresses,
            phone: (customer.phones && customer.phones[0]) || '',
            address: (customer.addresses && customer.addresses[0] && (customer.addresses[0].street || customer.addresses[0].addressLine)) || ''
        });
    } catch (error) {
        // Log full error for debugging including Mongo validation details
        try { console.error('User profile update error details:', JSON.stringify(error.errInfo || error, null, 2)); } catch (_) { console.error('User profile update error:', error); }
        if (error?.errInfo?.details) {
            return res.status(400).json({ message: 'Validation failed', details: error.errInfo.details });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/user-profile/password
// @desc    Change user password
// @access  Private
router.put('/password', [
    auth,
    body('currentPassword', 'Current password is required').exists(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/user-profile/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, async (req, res) => {
    try {
        const { preferences } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { preferences },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/user-profile/preferences/theme
// @desc    Toggle dark mode preference
// @access  Private
router.put('/preferences/theme', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Toggle dark mode
        user.preferences.darkModeEnabled = !user.preferences.darkModeEnabled;
        await user.save();

        res.json({ 
            darkModeEnabled: user.preferences.darkModeEnabled,
            message: `Dark mode ${user.preferences.darkModeEnabled ? 'enabled' : 'disabled'}`
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/user-profile/preferences/language
// @desc    Update user language preference
// @access  Private
router.put('/preferences/language', [
    auth,
    body('language', 'Language is required').not().isEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { language } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { 'preferences.language': language },
            { new: true }
        ).select('-password');

        res.json({ 
            language: user.preferences.language,
            message: 'Language preference updated'
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/user-profile/preferences/notifications
// @desc    Toggle notification preference
// @access  Private
router.put('/preferences/notifications', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Toggle notifications
        user.preferences.notificationsEnabled = !user.preferences.notificationsEnabled;
        await user.save();

        res.json({ 
            notificationsEnabled: user.preferences.notificationsEnabled,
            message: `Notifications ${user.preferences.notificationsEnabled ? 'enabled' : 'disabled'}`
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/user-profile
// @desc    Delete user account
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'User account deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/user-profile/image
// @desc    Update user profile image
// @access  Private
router.put('/image', auth, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update profile image URL
        user.profileImageUrl = `/uploads/${req.file.filename}`;
        await user.save();

        res.json({ 
            message: 'Profile image updated successfully',
            profileImageUrl: user.profileImageUrl
        });
    } catch (error) {
        console.error('Profile image update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

