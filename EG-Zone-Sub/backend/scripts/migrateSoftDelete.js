// Migration script to add soft delete fields to existing subscriptions
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

async function migrateSoftDeleteFields() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('subscriptions');

    // Find all documents that don't have isDeleted field
    const documentsWithoutSoftDelete = await collection.find({
      isDeleted: { $exists: false }
    }).toArray();

    console.log(`Found ${documentsWithoutSoftDelete.length} documents without soft delete fields`);

    if (documentsWithoutSoftDelete.length > 0) {
      // Add soft delete fields to all existing documents
      const result = await collection.updateMany(
        { isDeleted: { $exists: false } },
        {
          $set: {
            isDeleted: false,
            deletedAt: null,
            deletedReason: null,
            deletedBy: null
          }
        }
      );

      console.log(`Updated ${result.modifiedCount} documents with soft delete fields`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migrateSoftDeleteFields();
