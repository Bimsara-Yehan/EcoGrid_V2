const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const wasteRoutes = require('./routes/waste');

dotenv.config({ path: require('path').join(__dirname, '.env') });
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Admin:2vaCmirHh53cu96B@cluster0.7bzpi3q.mongodb.net/EcoGrid_V2?retryWrites=true&w=majority&appName=Cluster0';
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
    const PORT = process.env.PORT || 5004;
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

// Authentication endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Demo credentials validation
    if (username === 'operator' && password === 'incineration') {
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          role: 'operator',
          username: 'operator'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout endpoint (for completeness)
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

app.use('/api/waste', wasteRoutes);