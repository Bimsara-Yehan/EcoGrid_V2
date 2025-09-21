const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import new models
const User = require('../models/User');
const Customer = require('../models/Customer');
const Staff = require('../models/Staff');
const IncineratorUser = require('../models/IncineratorUser');

// Database connection
const DEFAULT_ATLAS_URI = 'mongodb+srv://Haritha:Haritha123@cluster0.7bzpi3q.mongodb.net/EcoGrid_V2?retryWrites=true&w=majority&appName=Cluster0';
const LOCAL_URI = 'mongodb://localhost:27017/EcoGrid_V2';
const mongoURI = process.env.MONGODB_URI || DEFAULT_ATLAS_URI || LOCAL_URI;

async function migrateData() {
    try {
        // Connect to database
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Get the old users collection (assuming it exists)
        const db = mongoose.connection.db;
        const oldUsersCollection = db.collection('users');
        const oldUsers = await oldUsersCollection.find({}).toArray();

        console.log(`Found ${oldUsers.length} users to migrate`);

        for (const oldUser of oldUsers) {
            try {
                // Create new User document
                const newUser = new User({
                    email: oldUser.email,
                    passwordHash: oldUser.password || oldUser.passwordHash || 'hashed:demo', // Handle existing password format
                    status: 'active',
                    roles: [mapOldRoleToNewRole(oldUser.role)],
                    lastLoginAt: oldUser.lastLoginAt || null
                });

                await newUser.save();
                console.log(`Created user: ${newUser.email}`);

                // Create role-specific document based on the role
                const role = mapOldRoleToNewRole(oldUser.role);
                
                if (role === 'customer') {
                    const customer = new Customer({
                        userId: newUser._id,
                        fullName: oldUser.name || 'Unknown User',
                        phones: oldUser.phone ? [{
                            number: oldUser.phone,
                            type: 'mobile',
                            isPrimary: true
                        }] : [],
                        addresses: oldUser.address ? [{
                            street: oldUser.address,
                            city: 'Unknown',
                            state: 'Unknown',
                            zipCode: '00000',
                            country: 'US',
                            isPrimary: true
                        }] : [],
                        ecopointsBalance: oldUser.ecopoints || 0,
                        ecopointsTransactions: [],
                        activeSubscriptionId: null,
                        preferences: oldUser.preferences || {
                            notificationsEnabled: true,
                            darkModeEnabled: false,
                            autoScheduleEnabled: true,
                            preferredCollectionTime: "09:00",
                            language: "en"
                        },
                        hasCompletedOnboarding: oldUser.hasCompletedOnboarding || false,
                        isVerified: oldUser.isVerified || false,
                        profileImageUrl: oldUser.profileImageUrl || null
                    });

                    await customer.save();
                    console.log(`Created customer profile for: ${newUser.email}`);
                } 
                else if (role === 'staff') {
                    const staff = new Staff({
                        userId: newUser._id,
                        fullName: oldUser.name || 'Unknown Staff',
                        employeeId: oldUser.employeeId || `EMP${Date.now()}`,
                        department: 'General',
                        position: 'Staff Member',
                        phone: oldUser.phone || null,
                        address: oldUser.address ? {
                            street: oldUser.address,
                            city: 'Unknown',
                            state: 'Unknown',
                            zipCode: '00000',
                            country: 'US'
                        } : undefined,
                        hireDate: oldUser.createdAt || new Date(),
                        isActive: true,
                        permissions: getDefaultStaffPermissions(oldUser.role),
                        profileImageUrl: oldUser.profileImageUrl || null
                    });

                    await staff.save();
                    console.log(`Created staff profile for: ${newUser.email}`);
                }
                else if (role === 'incinerator') {
                    const incineratorUser = new IncineratorUser({
                        userId: newUser._id,
                        fullName: oldUser.name || 'Unknown Incinerator User',
                        facilityId: oldUser.employeeId || `FAC${Date.now()}`,
                        facilityName: 'Default Facility',
                        facilityAddress: oldUser.address ? {
                            street: oldUser.address,
                            city: 'Unknown',
                            state: 'Unknown',
                            zipCode: '00000',
                            country: 'US'
                        } : {
                            street: 'Unknown',
                            city: 'Unknown',
                            state: 'Unknown',
                            zipCode: '00000',
                            country: 'US'
                        },
                        phone: oldUser.phone || null,
                        position: 'Operator',
                        isActive: true,
                        permissions: ['operate_incinerator', 'manage_waste'],
                        profileImageUrl: oldUser.profileImageUrl || null
                    });

                    await incineratorUser.save();
                    console.log(`Created incinerator user profile for: ${newUser.email}`);
                }

            } catch (error) {
                console.error(`Error migrating user ${oldUser.email}:`, error.message);
            }
        }

        console.log('Migration completed successfully!');
        
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

function mapOldRoleToNewRole(oldRole) {
    const roleMapping = {
        'User': 'customer',
        'Admin': 'admin',
        'Manager': 'staff',
        'TruckDriver': 'staff',
        'Incinerator': 'incinerator'
    };
    return roleMapping[oldRole] || 'customer';
}

function getDefaultStaffPermissions(role) {
    const permissions = {
        'Admin': ['admin_access'],
        'Manager': ['read_users', 'write_users', 'read_reports', 'write_reports', 'manage_tasks', 'manage_waste_collection'],
        'TruckDriver': ['manage_waste_collection', 'read_reports']
    };
    return permissions[role] || ['read_reports'];
}

// Run migration if this script is executed directly
if (require.main === module) {
    migrateData();
}

module.exports = { migrateData };

