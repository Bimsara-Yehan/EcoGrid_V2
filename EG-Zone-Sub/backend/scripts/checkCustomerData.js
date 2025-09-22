// Script to check customer data and zone references
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || (() => {
  const user = process.env.MONGO_USER;
  const pass = process.env.MONGO_PASS ? encodeURIComponent(process.env.MONGO_PASS) : "";
  const cluster = process.env.MONGO_CLUSTER;
  const db = process.env.MONGO_DB;
  return `mongodb+srv://${user}:${pass}@${cluster}/${db}?retryWrites=true&w=majority`;
})();

async function checkCustomerData() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Check customers collection
    const customers = await db.collection('customers').find({}).toArray();
    console.log(`\nTotal customers: ${customers.length}`);
    
    if (customers.length > 0) {
      console.log('\nCustomer data sample:');
      console.log(JSON.stringify(customers[0], null, 2));
      
      // Check which customers have zone references
      const customersWithZones = customers.filter(c => 
        c.addresses && c.addresses.some(addr => addr.zoneId)
      );
      console.log(`\nCustomers with zone references: ${customersWithZones.length}`);
      
      if (customersWithZones.length > 0) {
        console.log('\nCustomer with zone reference sample:');
        console.log(JSON.stringify(customersWithZones[0], null, 2));
      }
    }
    
    // Check zones collection
    const zones = await db.collection('zones').find({}).toArray();
    console.log(`\nTotal zones: ${zones.length}`);
    
    if (zones.length > 0) {
      console.log('\nZone data sample:');
      console.log(JSON.stringify(zones[0], null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run check
checkCustomerData();
