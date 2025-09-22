const mongoose = require('mongoose');

const communityEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    duration: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },
        coordinates: {
            latitude: {
                type: Number,
                required: true
            },
            longitude: {
                type: Number,
                required: true
            }
        }
    },
    organizer: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        contact: {
            phone: String,
            email: String
        }
    },
    maxParticipants: {
        type: Number,
        default: 50
    },
    currentParticipants: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
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
}, { collection: 'community_events' });

// Update timestamp on save
communityEventSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('CommunityEvent', communityEventSchema);
