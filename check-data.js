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

async function checkData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Check customer-subscriptions collection
    const customerSubscriptions = await db.collection('customer-subscriptions').find({}).limit(3).toArray();
    console.log(`\nTotal customer-subscriptions: ${customerSubscriptions.length}`);
    
    if (customerSubscriptions.length > 0) {
      console.log('\nCustomer subscription data sample:');
      console.log(JSON.stringify(customerSubscriptions[0], null, 2));
    }
    
    // Check customers collection
    const customers = await db.collection('customers').find({}).limit(3).toArray();
    console.log(`\nTotal customers: ${customers.length}`);
    
    if (customers.length > 0) {
      console.log('\nCustomer data sample:');
      console.log(JSON.stringify(customers[0], null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkData();





