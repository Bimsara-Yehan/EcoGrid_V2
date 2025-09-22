const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    category: {
        type: String,
        enum: ['Waste Collection', 'Recycling', 'Maintenance', 'Administrative', 'Emergency', 'Other'],
        default: 'Other',
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Under Review', 'Completed', 'Cancelled'],
        default: 'Pending',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dueDate: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date
    },
    attachments: [{
        filename: String,
        originalName: String,
        path: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
      notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  completionNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
    location: {
        address: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    estimatedDuration: {
        type: Number, // in minutes
        min: 0
    },
    actualDuration: {
        type: Number, // in minutes
        min: 0
    },
      tags: [String],
  ecopoints: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to get public task data
taskSchema.methods.getPublicData = function() {
    const taskObject = this.toObject();
    return taskObject;
};

// Static method to get tasks by status
taskSchema.statics.getByStatus = function(status) {
    return this.find({ status }).populate('assignedTo', 'name email role').sort({ createdAt: -1 });
};

// Static method to get tasks by priority
taskSchema.statics.getByPriority = function(priority) {
    return this.find({ priority }).populate('assignedTo', 'name email role').sort({ createdAt: -1 });
};

// Static method to get tasks by category
taskSchema.statics.getByCategory = function(category) {
    return this.find({ category }).populate('assignedTo', 'name email role').sort({ createdAt: -1 });
};

// Static method to get overdue tasks
taskSchema.statics.getOverdueTasks = function() {
    const now = new Date();
    return this.find({
        dueDate: { $lt: now },
        status: { $nin: ['Completed', 'Cancelled'] }
    }).populate('assignedTo', 'name email role').sort({ dueDate: 1 });
};

// Index for efficient queries
taskSchema.index({ assignedTo: 1, status: 1, createdAt: -1 });
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ priority: 1, createdAt: -1 });
taskSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
