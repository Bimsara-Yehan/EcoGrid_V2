const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'in_progress', 'resolved', 'rejected'],
    default: 'pending',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  }
});

// Update the updatedAt field before saving
reportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to get public report data (without sensitive info)
reportSchema.methods.getPublicData = function() {
  const reportObject = this.toObject();
  delete reportObject.adminNotes;
  delete reportObject.assignedTo;
  return reportObject;
};

// Static method to get reports by status
reportSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('user', 'name email').sort({ createdAt: -1 });
};

// Static method to get reports by severity
reportSchema.statics.getBySeverity = function(severity) {
  return this.find({ severity }).populate('user', 'name email').sort({ createdAt: -1 });
};

// Static method to get reports within a geographic area
reportSchema.statics.getByLocation = function(lat, lng, radiusKm = 5) {
  const radiusInDegrees = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
  
  return this.find({
    latitude: {
      $gte: lat - radiusInDegrees,
      $lte: lat + radiusInDegrees
    },
    longitude: {
      $gte: lng - radiusInDegrees,
      $lte: lng + radiusInDegrees
    }
  }).populate('user', 'name email').sort({ createdAt: -1 });
};

// Index for efficient queries
reportSchema.index({ latitude: 1, longitude: 1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ severity: 1, createdAt: -1 });
reportSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
