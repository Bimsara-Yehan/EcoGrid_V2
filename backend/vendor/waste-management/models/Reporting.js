const mongoose = require('mongoose');

const reportingSchema = new mongoose.Schema({
  landmarks: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true, trim: true }
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'reporting' });

reportingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

reportingSchema.index({ 'location.lat': 1, 'location.lng': 1, createdAt: -1 });
reportingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Reporting', reportingSchema);


