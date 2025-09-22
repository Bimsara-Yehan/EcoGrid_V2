const mongoose = require('mongoose');

const wasteCollectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    wasteType: {
        type: String,
        enum: [
            'GENERAL_WASTE',
            'RECYCLABLES', 
            'ORGANIC',
            'HAZARDOUS',
            'ELECTRONICS',
            'PAPER',
            'GLASS',
            'METAL'
        ],
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'SCHEDULED'
    },
    notes: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    weight: {
        type: Number,
        min: 0
    },
    completedDate: {
        type: Date
    },
    pickupLocation: {
        name: String,
        address: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
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

// Update timestamp on save
wasteCollectionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for waste type display name
wasteCollectionSchema.virtual('wasteTypeDisplay').get(function() {
    const displayNames = {
        'GENERAL_WASTE': 'General Waste',
        'RECYCLABLES': 'Recyclables',
        'ORGANIC': 'Organic',
        'HAZARDOUS': 'Hazardous',
        'ELECTRONICS': 'Electronics',
        'PAPER': 'Paper & Cardboard',
        'GLASS': 'Glass',
        'METAL': 'Metal'
    };
    return displayNames[this.wasteType] || this.wasteType;
});

// Virtual for waste type icon
wasteCollectionSchema.virtual('wasteTypeIcon').get(function() {
    const icons = {
        'GENERAL_WASTE': '🗑️',
        'RECYCLABLES': '♻️',
        'ORGANIC': '🌱',
        'HAZARDOUS': '⚠️',
        'ELECTRONICS': '📱',
        'PAPER': '📄',
        'GLASS': '🥃',
        'METAL': '🥫'
    };
    return icons[this.wasteType] || '🗑️';
});

// Ensure virtuals are included when converting to JSON
wasteCollectionSchema.set('toJSON', { virtuals: true });
wasteCollectionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('WasteCollection', wasteCollectionSchema);

