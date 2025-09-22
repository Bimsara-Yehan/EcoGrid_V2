const express = require('express');
const router = express.Router();

// Import existing handlers from vendor code
const { 
  getAllCustomers, 
  getCustomerById, 
  addCustomer, 
  updateCustomer, 
  deleteCustomer 
} = require('../vendor/waste/Controllers/CustomerController');

const { 
  getAllZones, 
  addZone, 
  getById, 
  UpdateZone, 
  deleteZone, 
  getCustomersForZone, 
  updateGeometry 
} = require('../vendor/waste/Controllers/ZoneController');

const { 
  getSummary,
  getAllSubscriptions,
  getSubscriptionById,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionsByZone
} = require('../vendor/waste/Controllers/SubController');

// Customer routes
router.get('/customers', getAllCustomers);
router.get('/customers/:id', getCustomerById);
router.post('/customers', addCustomer);
router.put('/customers/:id', updateCustomer);
router.delete('/customers/:id', deleteCustomer);

// Zone routes
router.get('/zones', getAllZones);
router.post('/zones', addZone);
router.get('/zones/:id', getById);
router.put('/zones/:id', UpdateZone);
router.delete('/zones/:id', deleteZone);
router.get('/zones/:id/customers', getCustomersForZone);
router.put('/zones/:id/geometry', updateGeometry);

// Subscription routes
router.get('/subscriptions', getAllSubscriptions);
router.get('/subscriptions/:id', getSubscriptionById);
router.post('/subscriptions', addSubscription);
router.put('/subscriptions/:id', updateSubscription);
router.delete('/subscriptions/:id', deleteSubscription);
router.get('/subscriptions/zone/:zoneId', getSubscriptionsByZone);

// Summary/Dashboard route
router.get('/summary', getSummary);

module.exports = router;
