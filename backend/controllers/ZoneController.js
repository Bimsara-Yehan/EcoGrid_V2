const Zone = require("../Model/ZoneModel");
const Customer = require("../Model/CustomerModel");

// Get all zones
const getAllZones = async (req, res, next) => {
  let zones;

  try {
    zones = await Zone.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  // Attach customersCount for each zone (support legacy field names)
  let countsByZoneId = {};
  try {
    const counts = await Customer.aggregate([
      // Normalize zone reference: prefer `zone`, fall back to `zoneId`
      { $addFields: { zoneRef: { $ifNull: ["$zone", "$zoneId"] } } },
      { $match: { zoneRef: { $ne: null } } },
      { $group: { _id: "$zoneRef", count: { $sum: 1 } } }
    ]);
    countsByZoneId = counts.reduce((acc, c) => {
      acc[String(c._id)] = c.count;
      return acc;
    }, {});
  } catch (err) {
    console.log(err);
  }

  const zonesWithCounts = (zones || []).map((z) => ({
    ...z.toObject(),
    customersCount: countsByZoneId[String(z._id)] || 0
  }));

  return res.status(200).json({ zones: zonesWithCounts });
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

//Delete Zone details
const deleteZone = async (req, res, next) => {
    console.log("Delete route hit");

    const id = req.params.id;

    let zone;

    try{
        zone = await Zone.findByIdAndDelete(id)
    }catch (err){
        console.log(err);
        return res.status(500).json({ message: "Server error"});
    }
    if (!zone) {
        return res.status(404).json({ message : "Unable to delete user details"});
    }
    return res.status(200).json({ message: "Zone deleted successfully",zone });

};

exports.getAllZones = getAllZones;
exports.addZone = addZone;
exports.getById = getById;
exports.UpdateZone = UpdateZone;
exports.deleteZone = deleteZone;

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

exports.getCustomersForZone = getCustomersForZone;

// Update only geometry/polygon of a zone
exports.updateGeometry = async (req, res) => {
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
