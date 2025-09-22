const mongoose = require('mongoose');

// Reuse same URIs as index.js
const DEFAULT_ATLAS_URI = 'mongodb+srv://Haritha:Haritha123@cluster0.7bzpi3q.mongodb.net/EcoGrid_V2?retryWrites=true&w=majority&appName=Cluster0';
const LOCAL_URI = 'mongodb://localhost:27017/EcoGrid_V2';
const mongoURI = process.env.MONGODB_URI || DEFAULT_ATLAS_URI || LOCAL_URI;

async function ensureCollections() {
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 8000,
  });

  const db = mongoose.connection.db;

  // Create collections if missing
  const collections = await db.listCollections().toArray();
  const names = collections.map(c => c.name);

  if (!names.includes('user_test')) {
    await db.createCollection('user_test');
    await db.collection('user_test').createIndex({ email: 1 }, { unique: true, name: 'uniq_email' });
  }

  if (!names.includes('customer_test')) {
    await db.createCollection('customer_test');
    await db.collection('customer_test').createIndex({ userId: 1 }, { unique: true, name: 'uniq_userId' });
  }

  // Seed minimal docs to verify linkage
  const userRes = await db.collection('user_test').insertOne({
    email: `seed+${Date.now()}@test.local`,
    passwordHash: 'seeded',
    status: 'active',
    roles: ['customer'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.collection('customer_test').insertOne({
    userId: userRes.insertedId,
    fullName: 'Seed User',
    phones: [],
    addresses: [],
    ecopointsBalance: 0,
    ecopointsTransactions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ Created/verified collections: user_test, customer_test');
  await mongoose.disconnect();
}

ensureCollections().catch(async (err) => {
  console.error('❌ initTestCollections error:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});










