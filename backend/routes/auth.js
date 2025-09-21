const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Staff = require('../models/Staff');
const auth = require('../middleware/auth');

const router = express.Router();

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage });

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', upload.single('profileImage'), [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    body('phone').optional({ checkFalsy: true })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, phone, address } = req.body;
        const normalizedEmail = email.toLowerCase();

        // Check if user already exists
        let user = await User.findOne({ email: normalizedEmail });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user with basic info
        user = new User({
            email: normalizedEmail,
            status: 'active',
            roles: ['customer']
        });

        // Set password using the new method
        await user.setPassword(password);
        await user.save();

        // Always create a Customer profile
        let profile = null;
        try {
            const safePhone = (phone && String(phone).trim()) ? String(phone).trim() : null;
            const safeAddress = (address && String(address).trim()) ? String(address).trim() : null;
            const customerData = {
                userId: user._id,
                fullName: name,
                ecopointsBalance: 0,
                ecopointsTransactions: [],
                activeSubscriptionId: null,
                preferences: {
                    notificationsEnabled: true,
                    darkModeEnabled: false,
                    autoScheduleEnabled: true,
                    preferredCollectionTime: '09:00',
                    language: 'en'
                },
                hasCompletedOnboarding: false,
                isVerified: false,
                // Conform to Customer schemas `phones` and `addresses`
                phones: safePhone ? [safePhone] : [], // Array of strings
                addresses: safeAddress ? [{ 
                    label: safeAddress, 
                    addressLine: safeAddress,
                    geo: { 
                        type: 'Point', 
                        coordinates: [0, 0] // Default coordinates, will be updated when user provides location
                    },
                    zoneId: null,
                    // Legacy fields for backward compatibility
                    street: safeAddress, 
                    city: 'Unknown', 
                    state: 'Unknown', 
                    zipCode: '00000', 
                    country: 'US', 
                    isPrimary: true 
                }] : []
            };
            if (req.file) {
                customerData.profileImageUrl = `/uploads/${req.file.filename}`;
            }
            profile = new Customer(customerData);
            await profile.save();
        } catch (e) {
            try { console.error('Customer create failed details:', JSON.stringify(e.errInfo || e, null, 2)); } catch (_) { console.error('Customer create failed:', e); }
            await User.deleteOne({ _id: user._id });
            // Surface validation errors when available
            if (e?.errInfo?.details) {
                return res.status(400).json({ message: 'Validation failed', details: e.errInfo.details });
            }
            return res.status(500).json({ message: 'Server error' });
        }

        // Create JWT token with role information
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key-ecogrid-2024',
            { expiresIn: '24h' }
        );

        // Return user data with role
        res.json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: profile ? profile.fullName : name,
                email: user.email,
                profileImageUrl: profile ? profile.profileImageUrl : (req.file ? `/uploads/${req.file.filename}` : null),
                hasCompletedOnboarding: !!(profile && profile.hasCompletedOnboarding),
                phone: (profile && profile.phones && profile.phones[0]) || '',
                address: (profile && profile.addresses && profile.addresses[0] && (profile.addresses[0].street || profile.addresses[0].addressLine)) || '',
                phones: profile ? profile.phones : [],
                addresses: profile ? profile.addresses : [],
                ecopointsBalance: profile ? profile.ecopointsBalance : 0,
                preferences: profile ? profile.preferences : {}
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        // Check if user exists
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // No role validation; single-account flow

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();

        // Get role-specific profile
        let profile = null;
        let profileData = {};
        
        if (true) {
            profile = await Customer.findOne({ userId: user._id });
            if (profile) {
                profileData = {
                    name: profile.fullName,
                    profileImageUrl: profile.profileImageUrl,
                    hasCompletedOnboarding: profile.hasCompletedOnboarding,
                    ecopointsBalance: profile.ecopointsBalance,
                    phones: profile.phones,
                    addresses: profile.addresses
                };
            }
        }

        // Create JWT token with role information
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key-ecogrid-2024',
            { expiresIn: '24h' }
        );

        // Return user data with role
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: profileData.name || 'Unknown User',
                email: user.email,
                profileImageUrl: profileData.profileImageUrl || user.profileImageUrl || null,
                hasCompletedOnboarding: profileData.hasCompletedOnboarding || false,
                phone: (profileData.phones && profileData.phones[0]) || '',
                address: (profileData.addresses && profileData.addresses[0] && (profileData.addresses[0].street || profileData.addresses[0].addressLine)) || '',
                // Include other profile data but don't override the flattened fields
                phones: profileData.phones,
                addresses: profileData.addresses,
                ecopointsBalance: profileData.ecopointsBalance,
                preferences: profileData.preferences
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        
        // Merge customer profile if it exists (no roles dependency)
        let profileData = {};
        const customer = await Customer.findOne({ userId: user._id });
        if (customer) {
            profileData = {
                name: customer.fullName,
                profileImageUrl: customer.profileImageUrl,
                hasCompletedOnboarding: customer.hasCompletedOnboarding,
                ecopointsBalance: customer.ecopointsBalance,
                phones: customer.phones,
                addresses: customer.addresses,
                phone: (customer.phones && customer.phones[0]) || '',
                address: (customer.addresses && customer.addresses[0] && (customer.addresses[0].addressLine || customer.addresses[0].street)) || '',
                preferences: customer.preferences
            };
        }

        const responseData = {
            ...user.toObject(),
            ...profileData
        };
        console.log('Auth /me response:', {
            phones: profileData.phones,
            phone: profileData.phone,
            addresses: profileData.addresses,
            address: profileData.address
        });
        res.json(responseData);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/onboarding
// @desc    Mark onboarding as completed
// @access  Private
router.put('/onboarding', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const primaryRole = user.roles[0];
        
        let updatedProfile = null;
        
        if (primaryRole === 'customer') {
            updatedProfile = await Customer.findOneAndUpdate(
                { userId: user._id },
                { hasCompletedOnboarding: true },
                { new: true }
            );
        } else if (primaryRole === 'incinerator') {
            updatedProfile = await IncineratorUser.findOneAndUpdate(
                { userId: user._id },
                { hasCompletedOnboarding: true },
                { new: true }
            );
        } else if (primaryRole === 'staff') {
            updatedProfile = await Staff.findOneAndUpdate(
                { userId: user._id },
                { hasCompletedOnboarding: true },
                { new: true }
            );
        }

        res.json({
            message: 'Onboarding completed',
            hasCompletedOnboarding: true,
            profile: updatedProfile
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/auth/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, async (req, res) => {
    try {
        const { preferences } = req.body;
        const user = await User.findById(req.user.id);
        const primaryRole = user.roles[0];
        
        let updatedProfile = null;
        
        if (primaryRole === 'customer') {
            updatedProfile = await Customer.findOneAndUpdate(
                { userId: user._id },
                { preferences },
                { new: true }
            );
        } else {
            return res.status(400).json({ message: 'Preferences can only be updated for customers' });
        }

        res.json({
            message: 'Preferences updated successfully',
            preferences: updatedProfile.preferences
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/create-staff-user
// @desc    Create staff user - Admin only
// @access  Private (Admin only)
router.post('/create-staff-user', auth, [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    body('employeeId', 'Employee ID is required').not().isEmpty(),
    body('department', 'Department is required').not().isEmpty(),
    body('position', 'Position is required').not().isEmpty(),
    body('phone').optional({ checkFalsy: true })
], async (req, res) => {
    try {
        // Check if current user is admin
        if (!req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, phone, address, employeeId, department, position } = req.body;
        const normalizedEmail = email.toLowerCase();

        // Check if user already exists
        let user = await User.findOne({ email: normalizedEmail });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Check if employee ID already exists
        const existingStaff = await Staff.findOne({ employeeId });
        if (existingStaff) {
            return res.status(400).json({ message: 'Employee ID already exists' });
        }

        // Create new user
        user = new User({
            email: normalizedEmail,
            status: 'active',
            roles: ['staff']
        });

        await user.setPassword(password);
        await user.save();

        // Create staff profile
        const staff = new Staff({
            userId: user._id,
            fullName: name,
            employeeId,
            department,
            position,
            phone: phone || null,
            address: address ? {
                street: address,
                city: 'Unknown',
                state: 'Unknown',
                zipCode: '00000',
                country: 'US'
            } : undefined,
            hireDate: new Date(),
            isActive: true,
            permissions: ['read_reports'] // Default permissions
        });

        await staff.save();

        res.json({
            message: 'Staff user created successfully',
            user: {
                id: user._id,
                name: staff.fullName,
                email: user.email,
                roles: user.roles,
                employeeId: staff.employeeId,
                department: staff.department,
                position: staff.position
            }
        });
    } catch (error) {
        console.error('Staff user creation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

