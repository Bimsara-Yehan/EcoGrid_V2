const mongoose = require('mongoose');

const wasteProcessingSchema = new mongoose.Schema({
    incinerator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Incinerator',
        required: true
    },
    operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    wasteType: {
        type: String,
        enum: ['plastic', 'polythene', 'kitchen_waste', 'glass', 'mixed', 'hazardous', 'medical', 'electronic'],
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        enum: ['kg', 'tons', 'cubic_meters'],
        default: 'kg'
    },
    processingStartTime: {
        type: Date,
        required: true
    },
    processingEndTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    temperature: {
        start: {
            type: Number,
            required: true
        },
        peak: {
            type: Number
        },
        end: {
            type: Number
        }
    },
    emissions: {
        co2: {
            type: Number,
            default: 0
        },
        nox: {
            type: Number,
            default: 0
        },
        so2: {
            type: Number,
            default: 0
        },
        particulate: {
            type: Number,
            default: 0
        }
    },
    ashProduced: {
        type: Number,
        default: 0
    },
    energyGenerated: {
        type: Number,
        default: 0
    },
    efficiency: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    notes: {
        type: String,
        trim: true
    },
    qualityCheck: {
        performed: {
            type: Boolean,
            default: false
        },
        passed: {
            type: Boolean
        },
        issues: [{
            type: String
        }],
        checkedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        checkedAt: {
            type: Date
        }
    },
    attachments: [{
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
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
wasteProcessingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to calculate processing duration
wasteProcessingSchema.methods.getProcessingDuration = function() {
    if (!this.processingEndTime) return null;
    return this.processingEndTime - this.processingStartTime;
};

// Method to calculate efficiency
wasteProcessingSchema.methods.calculateEfficiency = function() {
    if (this.quantity === 0) return 0;
    // Simple efficiency calculation based on energy generated vs waste processed
    const energyPerKg = this.energyGenerated / this.quantity;
    return Math.min(100, Math.round(energyPerKg * 10)); // Adjust multiplier as needed
};

// Method to check if processing is complete
wasteProcessingSchema.methods.isComplete = function() {
    return this.status === 'completed' && this.processingEndTime;
};

module.exports = mongoose.model('WasteProcessing', wasteProcessingSchema);











