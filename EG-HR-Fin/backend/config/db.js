const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection string from environment variable
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is required');
    }
    
    console.log('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔌 Connection ready for queries`);
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Check if MongoDB Atlas is accessible');
    console.log('2. Verify your connection string in config/db.js');
    console.log('3. Ensure your IP is whitelisted in MongoDB Atlas');
    console.log('4. Check if username/password are correct');
    console.log('\n💡 To get your connection string:');
    console.log('   - Go to https://cloud.mongodb.com');
    console.log('   - Click "Connect" on your cluster');
    console.log('   - Choose "Connect your application"');
    console.log('   - Copy the connection string');
    console.log('   - Replace "cluster0.xxxxx.mongodb.net" with your actual cluster URL');
    
    // Don't exit, throw the error so the server can handle it
    throw error;
  }
};

module.exports = connectDB;
