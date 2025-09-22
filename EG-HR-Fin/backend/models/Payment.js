const mongoose = require('mongoose');

// Payment schema mapped to 'paymentmodels' collection
// Made flexible to handle both old and new payment formats
const paymentSchema = new mongoose.Schema({
  // Classification (new format)
  category: { type: String, enum: ['Driver', 'Staff'], required: true },

  // Links
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: false },

  // Driver payment details (new format)
  driverName: { type: String, trim: true },
  route: { type: String, trim: true },
  distance: { type: Number, min: 0 },
  rate: { type: Number, min: 0 },

  // Staff payment details (new format)
  staffName: { type: String, trim: true },
  role: { type: String, trim: true },
  paymentType: { type: String, enum: ['Hourly', 'Daily'], required: false },
  hours: { type: Number, min: 0 },
  days: { type: Number, min: 0 },
  ratePerHour: { type: Number, min: 0 },
  ratePerDay: { type: Number, min: 0 },

  // Common fields (new format)
  totalAmount: { type: Number, min: 0 },
  date: { type: Date, required: false }, // Made not required to handle old format
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Paid', 'Cancelled'], default: 'Pending' },
  paymentMethod: { type: String, trim: true },
  notes: { type: String, trim: true },
  approvalNotes: { type: String, trim: true }, // Notes for approval/rejection

  // Old format fields (for backward compatibility)
  periodStart: { type: Date },
  periodEnd: { type: Date },
  calc: {
    daysWorked: { type: Number },
    kmDriven: { type: Number },
    perKmRate: { type: Number },
    hourlyRate: { type: Number },
    computedGross: { type: Number },
    adjustments: { type: Array, default: [] }
  },
  seedTag: { type: String }
}, {
  timestamps: true,
  strict: false // Allow additional fields
});

module.exports = mongoose.model('Payment', paymentSchema, 'payments');


