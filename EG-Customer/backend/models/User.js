const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Main User schema - contains basic user information
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    roles: {
        type: [String],
        default: ['customer']
    },
    passwordHash: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    },
    profileImageUrl: {
        type: String,
        default: null
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'users' });

// Method to set password (hash it before storing)
userSchema.methods.setPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(password, salt);
};

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to get public profile (without password)
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.passwordHash;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);

