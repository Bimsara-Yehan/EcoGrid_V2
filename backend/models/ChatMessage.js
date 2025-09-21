const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    response: {
        type: String,
        required: true,
        trim: true
    },
    intent: {
        type: String,
        enum: [
            'waste_collection_schedule',
            'recycling_guidance',
            'special_collection_request',
            'general_inquiry',
            'account_help',
            'app_navigation',
            'greeting',
            'goodbye',
            'unknown'
        ],
        default: 'unknown'
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0
    },
    quickActions: [{
        text: String,
        action: String,
        url: String
    }],
    isResolved: {
        type: Boolean,
        default: false
    },
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        submittedAt: Date
    },
    sessionId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying
chatMessageSchema.index({ user: 1, createdAt: -1 });
chatMessageSchema.index({ sessionId: 1 });

// Method to get chat history for a user
chatMessageSchema.statics.getChatHistory = function(userId, limit = 50) {
    return this.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('message response intent createdAt')
        .lean();
};

// Method to get session history
chatMessageSchema.statics.getSessionHistory = function(sessionId) {
    return this.find({ sessionId })
        .sort({ createdAt: 1 })
        .select('message response intent createdAt')
        .lean();
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);











