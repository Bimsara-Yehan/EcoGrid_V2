const mongoose = require('mongoose');

// MongoDB expects phones as array of strings, not objects
// We'll use a simple string schema for individual phone numbers
const phoneSchema = new mongoose.Schema({
    type: String,
    default: 'string'
}, { _id: false });

const addressSchema = new mongoose.Schema({
    label: {
        type: String,
        trim: true
    },
    addressLine: {
        type: String,
        trim: true
    },
    geo: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    zoneId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    // Legacy fields for backward compatibility
    street: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    zipCode: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true,
        default: 'US'
    },
    isPrimary: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const ecopointsTransactionSchema = new mongoose.Schema({
    amount: {
        type: Number
    },
    type: {
        type: String,
        enum: ['earned', 'spent', 'bonus', 'penalty']
    },
    description: {
        type: String,
        trim: true
    },
    source: {
        type: String,
        enum: ['recycling', 'waste_collection', 'composting', 'referral', 'purchase', 'admin_adjustment']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

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
    phones: [String], // MongoDB expects array of strings
    addresses: [addressSchema],
    ecopointsBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    ecopointsTransactions: [ecopointsTransactionSchema],
    activeSubscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        default: null
    },
    preferences: {
        notificationsEnabled: {
            type: Boolean,
            default: true
        },
        darkModeEnabled: {
            type: Boolean,
            default: false
        },
        autoScheduleEnabled: {
            type: Boolean,
            default: true
        },
        preferredCollectionTime: {
            type: String,
            default: "09:00"
        },
        language: {
            type: String,
            default: "en"
        }
    },
    hasCompletedOnboarding: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profileImageUrl: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'customers' });

// Method to add ecopoints
customerSchema.methods.addEcopoints = function(amount, type, description, source) {
    this.ecopointsBalance += amount;
    this.ecopointsTransactions.push({
        amount,
        type,
        description,
        source
    });
    return this.save();
};

// Method to spend ecopoints
customerSchema.methods.spendEcopoints = function(amount, description, source) {
    if (this.ecopointsBalance < amount) {
        throw new Error('Insufficient ecopoints balance');
    }
    this.ecopointsBalance -= amount;
    this.ecopointsTransactions.push({
        amount: -amount,
        type: 'spent',
        description,
        source
    });
    return this.save();
};

// Method to get primary phone
customerSchema.methods.getPrimaryPhone = function() {
    const primaryPhone = this.phones.find(phone => phone.isPrimary);
    return primaryPhone || this.phones[0];
};

// Method to get primary address
customerSchema.methods.getPrimaryAddress = function() {
    const primaryAddress = this.addresses.find(address => address.isPrimary);
    return primaryAddress || this.addresses[0];
};

module.exports = mongoose.model('Customer', customerSchema);

