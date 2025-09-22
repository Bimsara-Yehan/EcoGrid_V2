const mongoose = require('mongoose');

const incineratorSchema = new mongoose.Schema({
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
    facilityId: {
        type: String,
        required: true,
        trim: true
    },
    facilityName: {
        type: String,
        required: true,
        trim: true
    },
    facilityAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'US'
        }
    },
    phone: {
        type: String,
        trim: true
    },
    position: {
        type: String,
        required: true,
        trim: true
    },
    certifications: [{
        name: String,
        issuedBy: String,
        issuedDate: Date,
        expiryDate: Date,
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    operatingHours: {
        start: {
            type: String,
            default: "08:00"
        },
        end: {
            type: String,
            default: "17:00"
        },
        timezone: {
            type: String,
            default: "UTC"
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    permissions: [{
        type: String,
        enum: ['operate_incinerator', 'manage_waste', 'view_reports', 'manage_schedule', 'admin_access']
    }],
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
});

// Method to check if incinerator user has specific permission
incineratorSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission) || this.permissions.includes('admin_access');
};

// Method to check if facility is currently operating
incineratorSchema.methods.isCurrentlyOperating = function() {
    if (!this.isActive) return false;
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    return currentTime >= this.operatingHours.start && currentTime <= this.operatingHours.end;
};

// Method to get active certifications
incineratorSchema.methods.getActiveCertifications = function() {
    const now = new Date();
    return this.certifications.filter(cert => 
        cert.isActive && (!cert.expiryDate || cert.expiryDate > now)
    );
};

module.exports = mongoose.model('IncineratorUser', incineratorSchema);









