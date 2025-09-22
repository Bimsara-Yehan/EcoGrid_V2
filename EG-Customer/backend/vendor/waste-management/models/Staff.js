const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
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
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'US'
        }
    },
    hireDate: {
        type: Date,
        required: true
    },
    salary: {
        type: Number,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    permissions: [{
        type: String,
        enum: ['read_users', 'write_users', 'read_reports', 'write_reports', 'manage_tasks', 'manage_waste_collection', 'manage_incinerator', 'admin_access']
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

// Method to check if staff has specific permission
staffSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission) || this.permissions.includes('admin_access');
};

// Method to get public profile
staffSchema.methods.getPublicProfile = function() {
    const staffObject = this.toObject();
    delete staffObject.salary;
    return staffObject;
};

module.exports = mongoose.model('Staff', staffSchema);




