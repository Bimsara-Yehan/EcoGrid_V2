import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || (() => {
  const user = process.env.MONGO_USER;
  const pass = process.env.MONGO_PASS ? encodeURIComponent(process.env.MONGO_PASS) : "";
  const cluster = process.env.MONGO_CLUSTER;
  const db = process.env.MONGO_DB;
  return `mongodb+srv://${user}:${pass}@${cluster}/${db}?retryWrites=true&w=majority`;
})();

// Import the model
import WasteCustomerSubscription from './backend/models/WasteCustomerSubscription.js';

async function testModel() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Test the model
    const count = await WasteCustomerSubscription.countDocuments();
    console.log('Customer subscriptions count:', count);
    
    const subs = await WasteCustomerSubscription.find().limit(2);
    console.log('Sample subscriptions:', subs);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testModel();





