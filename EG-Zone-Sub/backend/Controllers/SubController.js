const Customer = require("../Model/CustomerModel");
const Subscription = require("../Model/SubModel");
const SubscriptionFinal = require('../Model/SubscriptionFinalModel');
const Zone = require('../Model/ZoneModel');

// Get all subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate("zoneId", "name areaType");
    // Always return 200 with an array, even if empty
    res.status(200).json(subscriptions || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get subscription by ID
const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate("zoneId", "name areaType");
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    res.status(200).json(subscription);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add subscription
const addSubscription = async (req, res) => {
  try {
    const payload = {
      zoneId: req.body.zoneId || req.body.zone,
      planName: req.body.planName,
      frequency: req.body.frequency,
      price: req.body.price,
      maxWeightPerPickupKg: req.body.maxWeightPerPickupKg ?? req.body.maxWeightPerPickup ?? null,
      wasteCategory: req.body.wasteCategory ?? null,
      description: req.body.description,
      active: req.body.active ?? req.body.isActive ?? true
    };

    const newSub = new Subscription(payload);
    await newSub.save();
    // Populate the zone before sending response
    await newSub.populate("zoneId", "name areaType");
    res.status(201).json({ message: "Subscription created", subscription: newSub });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update subscription
const updateSubscription = async (req, res) => {
  try {
    const payload = {
      ...(req.body.zoneId || req.body.zone ? { zoneId: req.body.zoneId || req.body.zone } : {}),
      ...(req.body.planName !== undefined ? { planName: req.body.planName } : {}),
      ...(req.body.frequency !== undefined ? { frequency: req.body.frequency } : {}),
      ...(req.body.price !== undefined ? { price: req.body.price } : {}),
      ...(req.body.maxWeightPerPickupKg !== undefined || req.body.maxWeightPerPickup !== undefined
        ? { maxWeightPerPickupKg: req.body.maxWeightPerPickupKg ?? req.body.maxWeightPerPickup }
        : {}),
      ...(req.body.wasteCategory !== undefined ? { wasteCategory: req.body.wasteCategory } : {}),
      ...(req.body.description !== undefined ? { description: req.body.description } : {}),
      ...(req.body.active !== undefined || req.body.isActive !== undefined ? { active: req.body.active ?? req.body.isActive } : {})
    };

    const updatedSub = await Subscription.findByIdAndUpdate(req.params.id, payload, { new: true }).populate("zoneId", "name areaType");
    if (!updatedSub) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    res.status(200).json({ message: "Subscription updated", subscription: updatedSub });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Soft delete subscription (preserves all data, just marks as deleted)
const deleteSubscription = async (req, res) => {
  try {
    const { reason, deletedBy } = req.body;
    const subscriptionId = req.params.id;

    // Check if subscription exists and is not already deleted
    const subscription = await SubscriptionFinal.findOne({
      _id: subscriptionId,
      $or: [
        { isDeleted: { $exists: false } }, // Old records without isDeleted field
        { isDeleted: false } // New records with isDeleted: false
      ]
    });
    
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found or already deleted" });
    }

    // Soft delete the subscription
    const deletedSub = await SubscriptionFinal.findByIdAndUpdate(
      subscriptionId,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedReason: reason || 'admin_cancelled',
        deletedBy: deletedBy || null
      },
      { new: true }
    );

    res.status(200).json({ 
      message: "Subscription soft deleted successfully", 
      subscription: deletedSub,
      note: "Data preserved for audit and recovery purposes"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Restore soft deleted subscription
const restoreSubscription = async (req, res) => {
  try {
    const subscriptionId = req.params.id;

    // Check if subscription exists and is deleted
    const subscription = await SubscriptionFinal.findOne({ 
      _id: subscriptionId, 
      isDeleted: true 
    });
    
    if (!subscription) {
      return res.status(404).json({ message: "Deleted subscription not found" });
    }

    // Restore the subscription
    const restoredSub = await SubscriptionFinal.findByIdAndUpdate(
      subscriptionId,
      {
        isDeleted: false,
        deletedAt: null,
        deletedReason: null,
        deletedBy: null
      },
      { new: true }
    );

    res.status(200).json({ 
      message: "Subscription restored successfully", 
      subscription: restoredSub
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Permanently delete subscription (only for admin use)
const permanentDeleteSubscription = async (req, res) => {
  try {
    const subscriptionId = req.params.id;

    // Check if subscription exists and is soft deleted
    const subscription = await SubscriptionFinal.findOne({ 
      _id: subscriptionId, 
      isDeleted: true 
    });
    
    if (!subscription) {
      return res.status(404).json({ message: "Soft deleted subscription not found" });
    }

    // Permanently delete
    await SubscriptionFinal.findByIdAndDelete(subscriptionId);

    res.status(200).json({ 
      message: "Subscription permanently deleted", 
      note: "This action cannot be undone"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get subscriptions by Zone
const getSubscriptionsByZone = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ zoneId: req.params.zoneId })
      .populate("zoneId", "name areaType");

    // Always return 200 with an array, even if empty
    res.status(200).json(subscriptions || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all customer subscriptions (actual customer subscriptions, not plans)
const getAllCustomerSubscriptions = async (req, res) => {
  try {
    // Handle both old records (without isDeleted) and new records (with isDeleted)
    const customerSubscriptions = await SubscriptionFinal.find({
      $or: [
        { isDeleted: { $exists: false } }, // Old records without isDeleted field
        { isDeleted: false } // New records with isDeleted: false
      ]
    })
      .populate("customerId", "fullName phones addresses")
      .populate("zoneId", "name areaType")
      .populate("planId", "planName frequency price");

    // Always return 200 with an array, even if empty
    res.status(200).json(customerSubscriptions || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getSummary = async (req, res) => {
  try {
    // Correct zone breakdown and total zones
    const zoneTypeCounts = await Zone.aggregate([
      { $group: { _id: "$areaType", count: { $sum: 1 } } }
    ]);
    const totalZones = await Zone.countDocuments();
    // Simplified active subscriptions filter
    const activeSubs = { 
      status: 'active',
      $or: [
        { isDeleted: { $exists: false } }, // Old records without isDeleted field
        { isDeleted: false } // New records with isDeleted: false
      ]
    };

    // 1. Customer count per zone
    const customerCountPerZone = await SubscriptionFinal.aggregate([
      { $match: activeSubs },
      { $group: { _id: '$zoneId', customerCount: { $sum: 1 } } },
      { $lookup: { from: 'zones', localField: '_id', foreignField: '_id', as: 'zone' } },
      { $unwind: '$zone' },
      { $project: { _id: 0, zoneId: '$_id', zoneName: '$zone.name', areaType: '$zone.areaType', customerCount: 1 } }
    ]);

    // 2. Customer count per frequency
    const customerCountPerFrequency = await SubscriptionFinal.aggregate([
      { $match: activeSubs },
      { $lookup: { from: 'subscriptionplans', localField: 'planId', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      { $group: { _id: '$plan.frequency', customerCount: { $sum: 1 } } }
    ]);

    // 3. Subscription count per frequency
    const subCountPerFrequency = await SubscriptionFinal.aggregate([
      { $lookup: { from: 'subscriptionplans', localField: 'planId', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      { $group: { _id: '$plan.frequency', subCount: { $sum: 1 } } }
    ]);

    // 4. Revenue overview per frequency (sum of plan prices for active subs)
    const revenuePerFrequency = await SubscriptionFinal.aggregate([
      { $match: activeSubs },
      { $lookup: { from: 'subscriptionplans', localField: 'planId', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      { $group: { _id: '$plan.frequency', totalRevenue: { $sum: '$plan.price' } } }
    ]);

    // 5. Revenue per zone (actual revenue from subscription plans)
    const revenuePerZone = await SubscriptionFinal.aggregate([
      { $match: activeSubs },
      { $lookup: { from: 'subscriptionplans', localField: 'planId', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      { $lookup: { from: 'zones', localField: 'zoneId', foreignField: '_id', as: 'zone' } },
      { $unwind: '$zone' },
      { $group: { 
          _id: '$zoneId', 
          zoneName: { $first: '$zone.name' },
          areaType: { $first: '$zone.areaType' },
          totalRevenue: { $sum: '$plan.price' },
          customerCount: { $sum: 1 }
        } 
      },
      { $project: { _id: 0, zoneId: '$_id', zoneName: 1, areaType: 1, totalRevenue: 1, customerCount: 1 } }
    ]);

  // Remove incorrect totalZones logic

    // 6. Customer coverage (unique active subscribed customers / total customers * 100)
    const totalCustomers = await Customer.countDocuments({});
    const activeSubscribedCustomers = await SubscriptionFinal.distinct('customerId', activeSubs);
    const customerCoverage = totalCustomers > 0 ? (activeSubscribedCustomers.length / totalCustomers * 100).toFixed(2) : 0;

    // 7. Customer distribution per zone (same as 1, but with percentages)
    const totalActiveCustomers = customerCountPerZone.reduce((sum, z) => sum + z.customerCount, 0);
    const customerDistribution = customerCountPerZone.map(z => ({
      ...z,
      percentage: totalActiveCustomers > 0 ? (z.customerCount / totalActiveCustomers * 100).toFixed(2) : 0
    }));

    // 8. Subscription growth line chart (monthly count of new subscriptions)
    const subscriptionGrowth = await SubscriptionFinal.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$startedAt' } }, subCount: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      customerCountPerZone,
      customerCountPerFrequency,
      subCountPerFrequency,
      revenuePerFrequency,
      revenuePerZone,
      totalZones,
      zoneTypeCounts,
      customerCoverage,
      customerDistribution,
      subscriptionGrowth
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSummary,
  getAllSubscriptions,
  getAllCustomerSubscriptions,
  getSubscriptionById,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  restoreSubscription,
  permanentDeleteSubscription,
  getSubscriptionsByZone
  
};

