const mongoose = require('mongoose');

const compostingStationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    location: {
        address: {
            type: String,
            required: true,
            trim: true
        },
        coordinates: {
            latitude: {
                type: Number,
                required: true,
                min: -90,
                max: 90
            },
            longitude: {
                type: Number,
                required: true,
                min: -180,
                max: 180
            }
        },
        area: {
            type: String,
            required: true,
            trim: true
        }
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
    operatingHours: {
        open: {
            type: String,
            required: true
        },
        close: {
            type: String,
            required: true
        },
        days: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }]
    },
    contact: {
        phone: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true
        }
    },
    facilities: [{
        type: String,
        enum: [
            'organic_waste_drop_off',
            'compost_pickup',
            'educational_workshops',
            'equipment_rental',
            'consultation_services',
            'community_garden',
            'waste_separation_guidance'
        ]
    }],
    status: {
        type: String,
        enum: ['operational', 'maintenance', 'temporarily_closed', 'full'],
        default: 'operational'
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    images: [{
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
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
}, { collection: 'compostingstations' }); // Explicitly specify the collection name

// Pre-save hook and methods remain unchanged
compostingStationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    if (this.ratings && this.ratings.length > 0) {
        const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
        this.averageRating = Math.round((totalRating / this.ratings.length) * 10) / 10;
    }
    next();
});

compostingStationSchema.methods.calculateDistance = function(userLat, userLng) {
    const R = 6371;
    const dLat = this.toRadians(this.location.coordinates.latitude - userLat);
    const dLng = this.toRadians(this.location.coordinates.longitude - userLng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRadians(userLat)) * Math.cos(this.toRadians(this.location.coordinates.latitude)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100;
};

compostingStationSchema.methods.toRadians = function(degrees) {
    return degrees * (Math.PI / 180);
};

compostingStationSchema.methods.isCurrentlyOpen = function() {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    if (!this.operatingHours.days.includes(currentDay)) {
        return false;
    }
    return currentTime >= this.operatingHours.open && currentTime <= this.operatingHours.close;
};

compostingStationSchema.statics.findNearby = function(userLat, userLng, maxDistance = 10) {
    return this.find({
        isActive: true,
        status: 'operational'
    }).then(stations => {
        return stations
            .map(station => ({
                ...station.toObject(),
                distance: station.calculateDistance(userLat, userLng)
            }))
            .filter(station => station.distance <= maxDistance)
            .sort((a, b) => a.distance - b.distance);
    });
};

module.exports = mongoose.model('CompostingStation', compostingStationSchema);