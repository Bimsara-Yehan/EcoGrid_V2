const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  // Legacy fields (from app UI)
  leaveRequestID: { type: String, required: false, unique: true, trim: true },
  staffID: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: false },
  leaveType: { type: String, required: false, enum: ['Annual', 'Sick', 'Casual', 'Maternity', 'Study', 'Unpaid', 'Other'], trim: true },
  startDate: { type: Date, required: false },
  endDate: { type: Date, required: false },
  totalDays: { type: Number, required: false, min: 1 },
  reason: { type: String, required: false, trim: true },

  // Request & Approval Process (legacy)
  status: { type: String, required: false, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'pending', 'approved', 'rejected'], default: 'pending' },
  requestedDate: { type: Date, required: false, default: Date.now },
  approvedRejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: false },
  approvedRejectedDate: { type: Date, required: false },
  adminComments: { type: String, trim: true, required: false },

  // Fields required by current collection validator
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: false },
  type: { type: String, required: false },
  from: { type: Date, required: false },
  to: { type: Date, required: false },
  approverId: { type: mongoose.Schema.Types.ObjectId, required: false },
  decisionAt: { type: Date, required: false }
}, { timestamps: true });

// Ensure proper unique index on the correct field name
leaveRequestSchema.index({ leaveRequestID: 1 }, { unique: true, sparse: true });

// Pre-save middleware to auto-generate unique Leave Request ID
leaveRequestSchema.pre('save', async function(next) {
  if (this.isNew && !this.leaveRequestID) {
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!isUnique && attempts < maxAttempts) {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 10000);
      this.leaveRequestID = `LR${year}${String(randomNum).padStart(4, '0')}`;
      
      // Check if this Leave Request ID already exists
      const existingRequest = await this.constructor.findOne({ leaveRequestID: this.leaveRequestID });
      if (!existingRequest) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (!isUnique) {
      return next(new Error('Unable to generate unique Leave Request ID after multiple attempts'));
    }
  }
  next();
});

// Use the existing 'leaverequestmodels' collection
const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema, 'leaverequestmodels');

// One-time fix: drop legacy wrong index (leaveRequestId_1) if it exists, then ensure correct indexes
process.nextTick(async () => {
  try {
    const indexes = await LeaveRequest.collection.indexes();
    const hasWrong = indexes.some((idx) => idx.name === 'leaveRequestId_1');
    if (hasWrong) {
      await LeaveRequest.collection.dropIndex('leaveRequestId_1');
      console.log('🛠️ Dropped legacy index leaveRequestId_1');
    }
    await LeaveRequest.syncIndexes();
  } catch (e) {
    console.warn('Index sync warning:', e.message);
  }
});

module.exports = LeaveRequest;
