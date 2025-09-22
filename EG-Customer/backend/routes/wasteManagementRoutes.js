const express = require('express');
const router = express.Router();

// Import existing handlers from vendor directory
const authRoutes = require('../vendor/waste-management/routes/auth');
const wasteCollectionRoutes = require('../vendor/waste-management/routes/wasteCollection');
const recyclingGuideRoutes = require('../vendor/waste-management/routes/recyclingGuide');
const userProfileRoutes = require('../vendor/waste-management/routes/userProfile');
const reportsRoutes = require('../vendor/waste-management/routes/reports');
const tasksRoutes = require('../vendor/waste-management/routes/tasks');
const incineratorRoutes = require('../vendor/waste-management/routes/incinerator');
const chatbotRoutes = require('../vendor/waste-management/routes/chatbot');
const compostingRoutes = require('../vendor/waste-management/routes/composting');
const reportingRoutes = require('../vendor/waste-management/routes/reporting');

// Mount all routes with their existing paths
router.use('/auth', authRoutes);
router.use('/waste-collection', wasteCollectionRoutes);
router.use('/recycling-guide', recyclingGuideRoutes);
router.use('/user-profile', userProfileRoutes);
router.use('/reports', reportsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/incinerator', incineratorRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/composting', compostingRoutes);
router.use('/reporting', reportingRoutes);

module.exports = router;
