const Zone = require("../Model/ZoneModel");
const Customer = require("../Model/CustomerModel");

// Get all zones
const getAllZones = async (req, res, next) => {
  try {
    const zones = await Zone.find();

    // Attach customersCount for each zone
    let countsByZoneId = {};
    try {
      const counts = await Customer.aggregate([
        // Unwind addresses array to work with individual addresses
        { $unwind: "$addresses" },
        // Match addresses that have a zoneId
        { $match: { "addresses.zoneId": { $ne: null } } },
        // Group by zoneId and count customers
        { $group: { _id: "$addresses.zoneId", count: { $sum: 1 } } }
      ]);
      countsByZoneId = counts.reduce((acc, c) => {
        acc[String(c._id)] = c.count;
        return acc;
      }, {});
    } catch (err) {
      console.log("Warning: Could not fetch customer counts:", err.message);
    }

    const zonesWithCounts = (zones || []).map((z) => ({
      ...z.toObject(),
      customersCount: countsByZoneId[String(z._id)] || 0
    }));

    return res.status(200).json({ zones: zonesWithCounts });
  } catch (err) {
    console.error("Error in getAllZones:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// Add a new zone (supports both old and new field names)
const addZone = async (req, res, next) => {
  const {
    name,
    description,
    areaType,
    type, // legacy
    customers,
    polygon,
    geometry // legacy
  } = req.body;

  const doc = {
    name,
    description,
    areaType: areaType || type,
    polygon: polygon || geometry,
    customers
  };

  let zone;
  try {
    zone = new Zone(doc);
    await zone.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to add zone" });
  }

  if (!zone) {
    return res.status(400).json({ message: "Unable to add zone" });
  }

  return res.status(201).json({ zone });
};

//Get by Id
const getById = async (req, res, next) => {

    const id = req.params.id;

    let zone;

    try {
        zone = await Zone.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }

    if (!zone) {
        return res.status(404).json({ message: "Zone not found" });
    }

    return res.status(200).json({ zone });

    }


// Update Zone details (supports both old and new field names)
const UpdateZone = async(req, res, next) => {
    const id = req.params.id;
    const { name, description, areaType, type, customers, polygon, geometry } = req.body;

    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (customers !== undefined) update.customers = customers;
    if (areaType !== undefined || type !== undefined) update.areaType = areaType || type;
    if (polygon !== undefined || geometry !== undefined) update.polygon = polygon || geometry;

    let zone;
    try{
        zone = await Zone.findByIdAndUpdate(id, update, { new: true });
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: "Server error"});
    }

    if (!zone) {
        return res.status(404).json({ message : "Zone not found"});
    }
    return res.status(200).json({ zone });
};

//Delete Zone details with cascading updates
const deleteZone = async (req, res, next) => {
    console.log("Delete zone route hit");

    const id = req.params.id;

    try {
        // First, check if zone exists
        const zone = await Zone.findById(id);
        if (!zone) {
            return res.status(404).json({ message: "Zone not found" });
        }

        // Delete all subscriptions related to this zone
        const SubscriptionFinal = require('../Model/SubscriptionFinalModel');
        const deletedSubscriptions = await SubscriptionFinal.deleteMany({ zoneId: id });
        console.log(`Deleted ${deletedSubscriptions.deletedCount} subscriptions for zone ${id}`);

        // Update customers to remove zone reference (set zoneId to null in addresses)
        const Customer = require('../Model/CustomerModel');
        const updatedCustomers = await Customer.updateMany(
            { 'addresses.zoneId': id },
            { $unset: { 'addresses.$.zoneId': 1 } }
        );
        console.log(`Updated ${updatedCustomers.modifiedCount} customers to remove zone reference`);

        // Finally, delete the zone
        const deletedZone = await Zone.findByIdAndDelete(id);
        
        return res.status(200).json({ 
            message: "Zone deleted successfully",
            zone: deletedZone,
            deletedSubscriptions: deletedSubscriptions.deletedCount,
            updatedCustomers: updatedCustomers.modifiedCount
        });

    } catch (err) {
        console.error("Zone deletion error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Exports will be moved to the end of the file

// Get customers for a zone
const getCustomersForZone = async (req, res, next) => {
  const id = req.params.id;
  try {
    const customers = await Customer.find({ $or: [{ zone: id }, { zoneId: id }] });
    return res.status(200).json(customers || []);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update only geometry/polygon of a zone
const updateGeometry = async (req, res) => {
  const id = req.params.id;
  const { geometry, polygon } = req.body;
  try {
    const zone = await Zone.findByIdAndUpdate(id, { polygon: polygon || geometry }, { new: true });
    if (!zone) return res.status(404).json({ message: "Zone not found" });
    return res.status(200).json({ zone });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Reassign customers to a new zone (update zone reference without changing address)
const reassignCustomersToZone = async (req, res) => {
  const { fromZoneId, toZoneId, customerIds } = req.body;
  
  try {
    // Validate that both zones exist
    const fromZone = await Zone.findById(fromZoneId);
    const toZone = await Zone.findById(toZoneId);
    
    if (!fromZone) {
      return res.status(404).json({ message: "Source zone not found" });
    }
    if (!toZone) {
      return res.status(404).json({ message: "Target zone not found" });
    }

    const Customer = require('../Model/CustomerModel');
    let updatedCustomers = 0;

    if (customerIds && Array.isArray(customerIds)) {
      // Reassign specific customers
      const result = await Customer.updateMany(
        { 
          _id: { $in: customerIds },
          'addresses.zoneId': fromZoneId 
        },
        { $set: { 'addresses.$.zoneId': toZoneId } }
      );
      updatedCustomers = result.modifiedCount;
    } else {
      // Reassign all customers from the source zone
      const result = await Customer.updateMany(
        { 'addresses.zoneId': fromZoneId },
        { $set: { 'addresses.$.zoneId': toZoneId } }
      );
      updatedCustomers = result.modifiedCount;
    }

    // Update subscriptions to the new zone
    const SubscriptionFinal = require('../Model/SubscriptionFinalModel');
    const updatedSubscriptions = await SubscriptionFinal.updateMany(
      { zoneId: fromZoneId },
      { zoneId: toZoneId }
    );

    return res.status(200).json({
      message: "Customers reassigned successfully",
      updatedCustomers: updatedCustomers,
      updatedSubscriptions: updatedSubscriptions.modifiedCount,
      fromZone: fromZone.name,
      toZone: toZone.name
    });

  } catch (err) {
    console.error("Customer reassignment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get customers in a specific zone
const getCustomersInZone = async (req, res) => {
  const zoneId = req.params.zoneId;
  
  try {
    const Customer = require('../Model/CustomerModel');
    const customers = await Customer.find({ 'addresses.zoneId': zoneId });
    
    return res.status(200).json({
      customers: customers,
      count: customers.length
    });
  } catch (err) {
    console.error("Get customers in zone error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Export all functions
exports.getAllZones = getAllZones;
exports.addZone = addZone;
exports.getById = getById;
exports.UpdateZone = UpdateZone;
exports.deleteZone = deleteZone;
exports.reassignCustomersToZone = reassignCustomersToZone;
exports.getCustomersInZone = getCustomersInZone;
exports.getCustomersForZone = getCustomersForZone;
exports.updateGeometry = updateGeometry;
