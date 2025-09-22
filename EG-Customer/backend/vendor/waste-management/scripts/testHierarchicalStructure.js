const mongoose = require('mongoose');
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

async function testHierarchicalStructure() {
    try {
        // Connect to database
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Test creating a user with customer role
        console.log('\n=== Testing Customer Creation ===');
        const testUser = new User({
            email: 'test@example.com',
            passwordHash: 'hashed:test123',
            status: 'active',
            roles: ['customer'],
            lastLoginAt: new Date()
        });

        await testUser.save();
        console.log('✓ User created:', testUser.email);

        // Create customer profile
        const customer = new Customer({
            userId: testUser._id,
            fullName: 'Test Customer',
            phones: [{
                number: '+1234567890',
                type: 'mobile',
                isPrimary: true
            }],
            addresses: [{
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                zipCode: '12345',
                country: 'US',
                isPrimary: true
            }],
            ecopointsBalance: 100,
            ecopointsTransactions: [{
                amount: 100,
                type: 'earned',
                description: 'Welcome bonus',
                source: 'admin_adjustment'
            }]
        });

        await customer.save();
        console.log('✓ Customer profile created');

        // Test ecopoints functionality
        await customer.addEcopoints(50, 'earned', 'Recycling reward', 'recycling');
        console.log('✓ Ecopoints added, new balance:', customer.ecopointsBalance);

        // Test staff creation
        console.log('\n=== Testing Staff Creation ===');
        const staffUser = new User({
            email: 'staff@example.com',
            passwordHash: 'hashed:staff123',
            status: 'active',
            roles: ['staff'],
            lastLoginAt: new Date()
        });

        await staffUser.save();
        console.log('✓ Staff user created:', staffUser.email);

        const staff = new Staff({
            userId: staffUser._id,
            fullName: 'Test Staff',
            employeeId: 'EMP001',
            department: 'Operations',
            position: 'Manager',
            phone: '+1234567891',
            hireDate: new Date(),
            permissions: ['read_users', 'write_users', 'manage_tasks']
        });

        await staff.save();
        console.log('✓ Staff profile created');

        // Test incinerator user creation
        console.log('\n=== Testing Incinerator User Creation ===');
        const incineratorUser = new User({
            email: 'incinerator@example.com',
            passwordHash: 'hashed:inc123',
            status: 'active',
            roles: ['incinerator'],
            lastLoginAt: new Date()
        });

        await incineratorUser.save();
        console.log('✓ Incinerator user created:', incineratorUser.email);

        const incinerator = new IncineratorUser({
            userId: incineratorUser._id,
            fullName: 'Test Incinerator Operator',
            facilityId: 'FAC001',
            facilityName: 'Test Waste Facility',
            facilityAddress: {
                street: '456 Facility Rd',
                city: 'Facility City',
                state: 'FC',
                zipCode: '54321',
                country: 'US'
            },
            phone: '+1234567892',
            position: 'Senior Operator',
            permissions: ['operate_incinerator', 'manage_waste']
        });

        await incinerator.save();
        console.log('✓ Incinerator user profile created');

        // Test queries
        console.log('\n=== Testing Queries ===');
        
        // Find all users
        const allUsers = await User.find({});
        console.log(`✓ Found ${allUsers.length} users`);

        // Find customer with populated data
        const customerWithUser = await Customer.findOne({ userId: testUser._id }).populate('userId');
        console.log('✓ Customer with user data:', customerWithUser.fullName);

        // Test staff permissions
        const hasPermission = staff.hasPermission('read_users');
        console.log('✓ Staff has read_users permission:', hasPermission);

        // Test incinerator operating status
        const isOperating = incinerator.isCurrentlyOperating();
        console.log('✓ Incinerator is currently operating:', isOperating);

        console.log('\n=== All Tests Passed! ===');
        console.log('The hierarchical structure is working correctly.');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run test if this script is executed directly
if (require.main === module) {
    testHierarchicalStructure();
}

module.exports = { testHierarchicalStructure };

