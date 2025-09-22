const mongoose = require('mongoose');
const User = require('../models/User');

// Simple connection function
const connectDB = async () => {
    try {
        const DEFAULT_ATLAS_URI = 'mongodb+srv://Haritha:Haritha123@cluster0.7bzpi3q.mongodb.net/ecogrid?retryWrites=true&w=majority&appName=Cluster0';
        const LOCAL_URI = 'mongodb://localhost:27017/ecogrid';
        
        const mongoURI = process.env.MONGODB_URI || DEFAULT_ATLAS_URI || LOCAL_URI;
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
        });
        
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('Trying local MongoDB...');
        
        try {
            await mongoose.connect('mongodb://localhost:27017/ecogrid', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to local MongoDB');
        } catch (localError) {
            console.error('Local MongoDB connection error:', localError);
            process.exit(1);
        }
    }
};

// Create test users
const createTestUsers = async () => {
    try {
        // Clear existing test users
        await User.deleteMany({ email: { $in: ['test@example.com', 'admin@example.com', 'incinerator@example.com'] } });
        console.log('Cleared existing test users');

        // Create test users
        const testUsers = [
            {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'User',
                phone: '+94 77 123 4567',
                address: '123 Test Street, Kandy',
                isVerified: true,
                hasCompletedOnboarding: true
            },
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'Admin',
                employeeId: 'ADM001',
                phone: '+94 77 234 5678',
                address: '456 Admin Avenue, Kandy',
                isVerified: true,
                hasCompletedOnboarding: true
            },
            {
                name: 'Incinerator Operator',
                email: 'incinerator@example.com',
                password: 'incinerator123',
                role: 'Incinerator',
                phone: '+94 77 345 6789',
                address: '789 Incinerator Road, Kandy',
                isVerified: true,
                hasCompletedOnboarding: true
            }
        ];

        const createdUsers = await User.insertMany(testUsers);
        console.log(`Created ${createdUsers.length} test users`);

        // Display created users
        createdUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.role})`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Password: ${testUsers[index].password}`);
            if (user.employeeId) {
                console.log(`   Employee ID: ${user.employeeId}`);
            }
            console.log('');
        });

        console.log('Test users created successfully!');
        console.log('\nYou can now login with:');
        console.log('1. test@example.com / password123 (User role)');
        console.log('2. admin@example.com / admin123 (Admin role)');
        console.log('3. incinerator@example.com / incinerator123 (Incinerator role)');
        
    } catch (error) {
        console.error('Error creating test users:', error);
    }
};

// Main execution
const main = async () => {
    await connectDB();
    await createTestUsers();
    await mongoose.connection.close();
    console.log('Database connection closed');
};

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { createTestUsers };











