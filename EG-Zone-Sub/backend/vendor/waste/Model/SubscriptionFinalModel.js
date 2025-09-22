// backend/Model/SubscriptionFinalModel.js
const mongoose = require('mongoose');

const subscriptionFinalSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  nextPickupDueAt: {
    type: Date,
    default: null
  },
  specialInstructions: {
    type: String
  },
  discountsApplied: [{
    source: { 
      type: String,
      enum: ['ecopoints', 'manual'] 
    },
    amount: { 
      type: Number 
    },
    refId: { 
      type: mongoose.Schema.Types.ObjectId, 
      default: null 
    }
  }],
  seedTag: {
    type: String
  }
}, { 
  timestamps: true, 
  collection: 'waste-subscriptions' 
});

// Indexes for performance
subscriptionFinalSchema.index({ zoneId: 1 });
subscriptionFinalSchema.index({ status: 1 });
subscriptionFinalSchema.index({ startedAt: 1 });
subscriptionFinalSchema.index({ customerId: 1 });

const WasteSubscriptionFinal = mongoose.models.WasteSubscriptionFinal || mongoose.model('WasteSubscriptionFinal', subscriptionFinalSchema, 'waste-subscriptions');

module.exports = WasteSubscriptionFinal;