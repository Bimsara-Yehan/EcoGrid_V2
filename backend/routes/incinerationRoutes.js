const express = require('express');
const router = express.Router();

// Import existing waste routes from vendor directory
const wasteRoutes = require('../vendor/incineration/routes/waste');

// Mount the waste routes under /api/incineration
router.use('/', wasteRoutes);

module.exports = router;

