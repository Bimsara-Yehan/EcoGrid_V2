const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CompostStation = require('../models/CompostStation');

dotenv.config();

const DEFAULT_ATLAS_URI = 'mongodb+srv://Haritha:Haritha123@cluster0.7bzpi3q.mongodb.net/EcoGrid_V2?retryWrites=true&w=majority&appName=Cluster0';
const LOCAL_URI = 'mongodb://localhost:27017/EcoGrid_V2';
const mongoURI = process.env.MONGODB_URI || DEFAULT_ATLAS_URI || LOCAL_URI;

async function run() {
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

  const seeds = [
    {
      name: 'Kandy City Compost Station',
      location: { lat: 7.2906, lng: 80.6337, address: 'Kandy City Center, Kandy' },
    },
    {
      name: 'Peradeniya Compost Station',
      location: { lat: 7.2715, lng: 80.5920, address: 'Peradeniya, Kandy' },
    },
    {
      name: 'Katugastota Compost Station',
      location: { lat: 7.3516, lng: 80.6234, address: 'Katugastota, Kandy' },
    },
    {
      name: 'Tennekumbura Compost Station',
      location: { lat: 7.2839, lng: 80.6642, address: 'Tennekumbura, Kandy' },
    },
    {
      name: 'Ampitiya Compost Station',
      location: { lat: 7.2734, lng: 80.6591, address: 'Ampitiya, Kandy' },
    },
  ];

  try {
    await CompostStation.deleteMany({});
    const created = await CompostStation.insertMany(seeds.map(s => ({ ...s, isActive: true })));
    console.log(`Inserted ${created.length} compost stations.`);
  } catch (e) {
    console.error('Seed error:', e);
  } finally {
    await mongoose.disconnect();
  }
}

run();



