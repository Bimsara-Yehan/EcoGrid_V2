const mongoose = require('mongoose');

// MongoDB connection string
const mongoURI = 'mongodb+srv://deeghayu_db_user:Deeghayu_123@cluster0.7bzpi3q.mongodb.net/EcoGrid_V2?retryWrites=true&w=majority';

async function debugDatabase() {
  try {
    console.log('🔍 Starting database debug...');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully!');
    
    // Get database info
    const db = mongoose.connection.db;
    console.log(`📊 Database name: ${db.databaseName}`);
    
    // List all collections
    console.log('\n📋 Collections in database:');
    const collections = await db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Check staff collection specifically (try both names)
    console.log('\n👥 Checking staff collections...');
    
    // Try staffmodels collection
    const staffModelsCollection = db.collection('staffmodels');
    const staffModelsCount = await staffModelsCollection.countDocuments();
    console.log(`📊 staffmodels collection count: ${staffModelsCount}`);
    
    if (staffModelsCount > 0) {
      console.log('\n📄 Sample staff documents from staffmodels:');
      const sampleStaff = await staffModelsCollection.find({}).limit(3).toArray();
      sampleStaff.forEach((staff, index) => {
        console.log(`\n  Staff ${index + 1}:`);
        console.log(`    ID: ${staff._id}`);
        console.log(`    Staff ID: ${staff.staffID || 'N/A'}`);
        console.log(`    Name: ${staff.name || staff.fullName || 'N/A'}`);
        console.log(`    Role: ${staff.role || staff.jobTitle || 'N/A'}`);
        console.log(`    Gmail: ${staff.gmail || staff.email || 'N/A'}`);
        console.log(`    Phone: ${staff.phone || staff.contactNumbers || 'N/A'}`);
      });
    }
    
    // Try staffs collection
    const staffsCollection = db.collection('staffs');
    const staffsCount = await staffsCollection.countDocuments();
    console.log(`📊 staffs collection count: ${staffsCount}`);
    
    if (staffsCount > 0) {
      console.log('\n📄 Sample staff documents from staffs:');
      const sampleStaff = await staffsCollection.find({}).limit(3).toArray();
      sampleStaff.forEach((staff, index) => {
        console.log(`\n  Staff ${index + 1}:`);
        console.log(`    ID: ${staff._id}`);
        console.log(`    Staff ID: ${staff.staffID || 'N/A'}`);
        console.log(`    Name: ${staff.name || staff.fullName || 'N/A'}`);
        console.log(`    Role: ${staff.role || staff.jobTitle || 'N/A'}`);
        console.log(`    Gmail: ${staff.gmail || staff.email || 'N/A'}`);
        console.log(`    Phone: ${staff.phone || staff.contactNumbers || 'N/A'}`);
      });
    }
    
    // Test the Staff model
    console.log('\n🧪 Testing Staff model...');
    const Staff = require('./models/Staff');
    
    // Try to find all staff
    const allStaff = await Staff.find({});
    console.log(`📊 Staff model find count: ${allStaff.length}`);
    
    if (allStaff.length > 0) {
      console.log('\n📋 Staff from model:');
      allStaff.forEach((staff, index) => {
        console.log(`\n  ${index + 1}. ${staff.name} (${staff.staffID})`);
        console.log(`     Role: ${staff.role}`);
        console.log(`     Gmail: ${staff.gmail}`);
        console.log(`     Phone: ${staff.phone}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database debug error:', error.message);
    console.error('Full error:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the debug
debugDatabase();
