const mongoose = require('mongoose');

// MongoDB connection string
const mongoURI = 'mongodb+srv://deeghayu_db_user:Deeghayu_123@cluster0.7bzpi3q.mongodb.net/EcoGrid_V2?retryWrites=true&w=majority';

async function migrateStaffIds() {
  try {
    console.log('🔄 Starting staff ID migration...');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully!');
    
    // Import Staff model
    const Staff = require('./models/Staff');
    
    // Find all staff without staffID
    const staffWithoutId = await Staff.find({ staffID: { $exists: false } });
    console.log(`📊 Found ${staffWithoutId.length} staff members without Staff ID`);
    
    if (staffWithoutId.length === 0) {
      console.log('✅ All staff members already have Staff IDs!');
      return;
    }
    
    // Generate Staff IDs for each staff member
    for (let i = 0; i < staffWithoutId.length; i++) {
      const staff = staffWithoutId[i];
      
      // Generate unique Staff ID
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;
      let staffID;
      
      while (!isUnique && attempts < maxAttempts) {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 10000);
        staffID = `STF${year}${String(randomNum).padStart(4, '0')}`;
        
        // Check if this Staff ID already exists
        const existingStaff = await Staff.findOne({ staffID: staffID });
        if (!existingStaff) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (!isUnique) {
        console.error(`❌ Failed to generate unique Staff ID for ${staff.name}`);
        continue;
      }
      
      // Update the staff member with the new Staff ID
      await Staff.findByIdAndUpdate(staff._id, { staffID: staffID });
      console.log(`✅ Added Staff ID ${staffID} to ${staff.name}`);
    }
    
    console.log('\n🎉 Staff ID migration completed!');
    
    // Verify the migration
    const allStaff = await Staff.find({});
    console.log(`\n📊 Total staff members: ${allStaff.length}`);
    
    const staffWithIds = await Staff.find({ staffID: { $exists: true } });
    console.log(`📊 Staff members with IDs: ${staffWithIds.length}`);
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error('Full error:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the migration
migrateStaffIds();
