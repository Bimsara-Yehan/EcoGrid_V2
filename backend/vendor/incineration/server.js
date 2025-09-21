const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const wasteRoutes = require('./routes/waste');

dotenv.config({ path: require('path').join(__dirname, '.env') });
const app = express();
// Enhanced CORS configuration for mobile compatibility
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-api-key', 
    'Cache-Control',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  optionsSuccessStatus: 200
}));

// Mobile-optimized JSON parsing
app.use(express.json({ 
  limit: '1mb',
  type: 'application/json'
}));

// Mobile-optimized URL encoding
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb' 
}));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecogrid-incineration';
console.log('Connecting to MongoDB:', MONGO_URI);
// Disable Mongoose buffering so requests fail fast if DB is unavailable
try {
  require('mongoose').set('bufferCommands', false);
} catch (e) {}
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 20000,
})
  .then(() => {
    console.log('MongoDB connected');
    // Start server only after successful DB connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.error('Ensure MongoDB is running and MONGO_URI is correct.');
  });

// Basic health check
app.get('/health', (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({ ok: true, mongoState: state });
});

app.use('/api/waste', wasteRoutes);