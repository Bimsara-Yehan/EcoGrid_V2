const mongoose = require('mongoose');
const User = require('../models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Haritha:Haritha123@cluster0.7bzpi3q.mongodb.net/ecogrid?retryWrites=true&w=majority&appName=Cluster0';

async function removeTestUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // List of test user emails to remove
        const testEmails = [
            'admin@ecogrid.com',
            'manager@ecogrid.com',
            'driver@ecogrid.com',
            'incinerator@ecogrid.com',
            'user@ecogrid.com'
        ];

        // Remove test users by email
        const result = await User.deleteMany({
            email: { $in: testEmails }
        });

        console.log(`✅ Removed ${result.deletedCount} test users from the database`);
        
        if (result.deletedCount > 0) {
            console.log('\nRemoved test users:');
            testEmails.forEach(email => {
                console.log(`- ${email}`);
            });
        } else {
            console.log('\nNo test users found to remove');
        }

        // Show remaining users
        const remainingUsers = await User.find({}, 'email role createdAt');
        console.log(`\n📊 Remaining users in database: ${remainingUsers.length}`);
        
        if (remainingUsers.length > 0) {
            console.log('\nRemaining users:');
            remainingUsers.forEach(user => {
                console.log(`- ${user.email} (${user.role}) - Created: ${user.createdAt.toLocaleDateString()}`);
            });
        }

    } catch (error) {
        console.error('Error removing test users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the script
removeTestUsers();

