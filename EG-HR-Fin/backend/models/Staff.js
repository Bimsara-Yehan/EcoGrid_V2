const mongoose = require('mongoose');
const Counter = require('./Counter');

const staffSchema = new mongoose.Schema({
  // Core Staff Attributes
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: false,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  nic: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  gmail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  
  // Legacy/validator-required fields from existing collection
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  staffType: {
    type: String,
    required: false,
    enum: ['driver', 'scheduler', 'zone_manager', 'incineration_operator', 'finance_manager']
  },
  driver: {
    type: Object,
    required: false,
    default: {}
  },
  payProfile: {
    type: Object,
    required: false,
    default: {}
  },
  seedTag: {
    type: String,
    required: false,
    default: 'APP_CREATE'
  },
  
  // Employment Details (now optional)
  dateOfJoining: {
    type: Date,
    required: false
  },
  employmentStatus: {
    type: String,
    required: false,
    enum: ['Active', 'On Leave', 'Resigned', 'Retired'],
    default: 'Active'
  },
  supervisor: {
    type: String,
    trim: true,
    required: false
  },
  // Auto-incremented StaffID (numeric string)
  staffID: {
    type: Number,
    unique: true,
    required: false
  }
}, {
  timestamps: true
});

// Employee ID used by legacy unique index; generate if missing
staffSchema.add({
  employeeId: {
    type: String,
    required: false,
    unique: true,
    trim: true
  }
});

// Enforce uniqueness only when fields are present to avoid conflicts with
// legacy documents that may miss these fields
staffSchema.index(
  { gmail: 1 },
  { unique: true, partialFilterExpression: { gmail: { $type: 'string' } } }
);
staffSchema.index(
  { nic: 1 },
  { unique: true, partialFilterExpression: { nic: { $type: 'string' } } }
);
staffSchema.index(
  { employeeId: 1 },
  { unique: true, partialFilterExpression: { employeeId: { $type: 'string' } } }
);

// Pre-save to generate incremental staffID if missing
staffSchema.pre('save', async function(next) {
  try {
    if (this.isNew && (this.staffID === undefined || this.staffID === null)) {
      // Generate a unique timestamp-based ID with random component
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      // Use a smaller number to avoid integer overflow
      this.staffID = Math.floor(timestamp / 1000) * 10000 + random;
    }
    if (this.isNew && (this.employeeId === undefined || this.employeeId === null)) {
      // Generate a human-readable unique employeeId
      const randomSegment = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.employeeId = `EMP-${Date.now()}-${randomSegment}`;
    }
    next();
  } catch (err) {
    console.error('Error in staff pre-save:', err);
    next(err);
  }
});

// Use the 'staffs' collection to match MongoDB Atlas view
module.exports = mongoose.model('Staff', staffSchema, 'staffs');
