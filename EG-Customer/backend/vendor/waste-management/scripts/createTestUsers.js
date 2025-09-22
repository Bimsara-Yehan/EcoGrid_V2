const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Haritha:Haritha123@cluster0.7bzpi3q.mongodb.net/ecogrid?retryWrites=true&w=majority&appName=Cluster0';

const testUsers = [
    {
        name: 'Admin User',
        email: 'admin@ecogrid.com',
        password: 'admin123',
        role: 'Admin',
        employeeId: 'EMP001'
    },
    {
        name: 'Manager User',
        email: 'manager@ecogrid.com',
        password: 'manager123',
        role: 'Manager',
        employeeId: 'EMP002'
    },
    {
        name: 'Truck Driver',
        email: 'driver@ecogrid.com',
        password: 'driver123',
        role: 'TruckDriver',
        employeeId: 'EMP003'
    },
    {
        name: 'Incinerator User',
        email: 'incinerator@ecogrid.com',
        password: 'incinerator123',
        role: 'Incinerator'
    },
    {
        name: 'Regular User',
        email: 'user@ecogrid.com',
        password: 'user123',
        role: 'User'
    }
];

async function createTestUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing test users
        await User.deleteMany({
            email: { $in: testUsers.map(u => u.email) }
        });
        console.log('Cleared existing test users');

        // Create new test users
        for (const userData of testUsers) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            const user = new User({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                role: userData.role,
                employeeId: userData.employeeId, // Will be undefined for User/Incinerator
                isVerified: true,
                hasCompletedOnboarding: true
            });

            await user.save();
            console.log(`Created ${userData.role} user: ${userData.email} (Password: ${userData.password})`);
            if (userData.employeeId) {
                console.log(`  Employee ID: ${userData.employeeId}`);
            }
        }

        console.log('\n✅ All test users created successfully!');
        console.log('\nTest Credentials:');
        console.log('\n=== Admin Users (Login with Employee ID) ===');
        testUsers.filter(u => u.employeeId).forEach(user => {
            console.log(`${user.role}: Employee ID: ${user.employeeId} / Password: ${user.password}`);
        });
        console.log('\n=== Regular Users (Login with Email) ===');
        testUsers.filter(u => !u.employeeId).forEach(user => {
            console.log(`${user.role}: ${user.email} / Password: ${user.password}`);
        });

    } catch (error) {
        console.error('Error creating test users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
createTestUsers();
