const mongoose = require('mongoose');

const incineratorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 0
    },
    currentLoad: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['operational', 'maintenance', 'shutdown', 'emergency'],
        default: 'operational'
    },
    temperature: {
        current: {
            type: Number,
            default: 0
        },
        optimal: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
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
    efficiency: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    lastMaintenance: {
        type: Date
    },
    nextMaintenance: {
        type: Date
    },
    operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
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
incineratorSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to calculate efficiency based on current load and capacity
incineratorSchema.methods.calculateEfficiency = function() {
    if (this.capacity === 0) return 0;
    return Math.round((this.currentLoad / this.capacity) * 100);
};

// Method to check if incinerator is overloaded
incineratorSchema.methods.isOverloaded = function() {
    return this.currentLoad > this.capacity;
};

// Method to check if temperature is within safe range
incineratorSchema.methods.isTemperatureSafe = function() {
    return this.temperature.current >= this.temperature.optimal * 0.8 && 
           this.temperature.current <= this.temperature.max;
};

module.exports = mongoose.model('Incinerator', incineratorSchema);











