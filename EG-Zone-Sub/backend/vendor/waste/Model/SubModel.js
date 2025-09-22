const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WasteZone",
    required: true
  },
  planName: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    enum: ["weekly", "bi-weekly", "monthly"], // match MongoDB validator
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  maxWeightPerPickupKg: {
    type: Number,
    min: 0,
    default: null
  },
  wasteCategory: {
    type: mongoose.Schema.Types.Mixed, 
    // can be ObjectId, String, or null (matches validator)
    default: null
  },
  description: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  },
  version: {
    type: Number,
    default: 1,    
    select: false
  },
  seedTag: {
    type: String,
    trim: true,
    select: false
  }
}, { 
  timestamps: true,
  collection: "waste-subscription-plans" // 👈 explicit collection name
});

// Indexes for faster queries
subscriptionPlanSchema.index({ zoneId: 1 });
subscriptionPlanSchema.index({ active: 1 });
subscriptionPlanSchema.index({ frequency: 1 });

// Optional virtual for formatted price
subscriptionPlanSchema.virtual("formattedPrice").get(function() {
  return `Rs.${this.price.toFixed(2)}`; // adapted to LKR style
});

// Ensure virtuals are included in JSON and objects
subscriptionPlanSchema.set("toJSON", { virtuals: true });
subscriptionPlanSchema.set("toObject", { virtuals: true });

const WasteSubscriptionPlan = mongoose.models.WasteSubscriptionPlan || mongoose.model("WasteSubscriptionPlan", subscriptionPlanSchema, "waste-subscription-plans");

module.exports = WasteSubscriptionPlan;

