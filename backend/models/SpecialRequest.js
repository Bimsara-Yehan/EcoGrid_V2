const mongoose = require('mongoose');

const specialRequestSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    wasteType: {
        type: String,
        required: true,
        enum: [
            'plastic',
            'glass', 
            'paper',
            'metal',
            'kitchen_waste',
            'polythene',
            'mixed_collection',
            'bulk_items',
            'construction_waste',
            'hazardous_waste',
            'electronic_waste',
            'garden_waste',
            'other'
        ]
    },
    quantity: {
        type: String,
        required: true,
        enum: ['small', 'medium', 'large', 'bulk']
    },
    preferredDate: {
        type: Date,
        required: true
    },
    preferredTime: {
        type: String,
        required: true,
        enum: ['morning', 'afternoon', 'evening']
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'scheduled', 'in_progress', 'completed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    assignedDriver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    scheduledDate: {
        type: Date,
        default: null
    },
    completedDate: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: 500
    },
    // Customer details populated from Customer collection
    customerDetails: {
        name: String,
        email: String,
        phone: String,
        address: String
    }
}, {
    timestamps: true
});

// Indexes for better query performance
specialRequestSchema.index({ customerId: 1, status: 1 });
specialRequestSchema.index({ status: 1, preferredDate: 1 });
specialRequestSchema.index({ assignedDriver: 1, status: 1 });
specialRequestSchema.index({ createdAt: -1 });

// Virtual for formatted preferred date
specialRequestSchema.virtual('formattedPreferredDate').get(function() {
    return this.preferredDate.toLocaleDateString();
});

// Virtual for status display
specialRequestSchema.virtual('statusDisplay').get(function() {
    const statusMap = {
        'pending': 'Pending Review',
        'approved': 'Approved',
        'scheduled': 'Scheduled',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'rejected': 'Rejected'
    };
    return statusMap[this.status] || this.status;
});

// Method to populate customer details
specialRequestSchema.methods.populateCustomerDetails = async function() {
    const Customer = require('./Customer');
    const customer = await Customer.findById(this.customerId);
    if (customer) {
        this.customerDetails = {
            name: customer.fullName,
            email: customer.userId ? (await require('./User').findById(customer.userId))?.email : null,
            phone: customer.phones && customer.phones[0] ? customer.phones[0] : null,
            address: customer.addresses && customer.addresses[0] ? 
                (customer.addresses[0].street || customer.addresses[0].addressLine) : null
        };
    }
    return this;
};

// Ensure virtuals are included when converting to JSON
specialRequestSchema.set('toJSON', { virtuals: true });
specialRequestSchema.set('toObject', { virtuals: true });

// Guard against re-registration in case of hot reloading
const SpecialRequest = mongoose.models.SpecialRequest || mongoose.model('SpecialRequest', specialRequestSchema);
module.exports = SpecialRequest;
