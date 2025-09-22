const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  areaType: {
    type: String,
    enum: ["Urban", "Rural", "Suburban"], // must match validator
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  polygon: {
    type: {
      type: String,
      enum: ["Polygon"], // only Polygon allowed
      required: true
    },
    coordinates: {
      type: [[[Number]]], // Array of arrays of lng/lat
      required: true
    }
  },
  createdByStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff", // optional: link to Staff model if you have one
    default: null
  },
  seedTag: {
    type: String,
    trim: true,
    select: false
    
  },
  customers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "WasteCustomer"
  }]
}, { 
  timestamps: true, 
  collection: "waste-zones"  // explicitly match Atlas collection
});

const WasteZone = mongoose.models.WasteZone || mongoose.model("WasteZone", zoneSchema, "waste-zones");

module.exports = WasteZone;
