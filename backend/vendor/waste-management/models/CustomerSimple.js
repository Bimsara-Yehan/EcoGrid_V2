const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phones: [{
        number: String,
        type: { type: String, default: 'mobile' },
        isPrimary: { type: Boolean, default: false }
    }],
    addresses: [{
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'US' },
        isPrimary: { type: Boolean, default: false }
    }],
    ecopointsBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    ecopointsTransactions: [{
        amount: Number,
        type: String,
        description: String,
        source: String,
        createdAt: { type: Date, default: Date.now }
    }],
    activeSubscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        default: null
    },
    profileImageUrl: {
        type: String,
        trim: true
    },
    preferences: {
        notificationsEnabled: { type: Boolean, default: true },
        darkModeEnabled: { type: Boolean, default: false },
        autoScheduleEnabled: { type: Boolean, default: true },
        preferredCollectionTime: { type: String, default: "09:00" },
        language: { type: String, default: "en" }
    },
    hasCompletedOnboarding: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
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

module.exports = mongoose.model('Customer', customerSchema);