require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (required for integration)
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Test route to verify server is running
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Routes
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/leaverequests', require('./routes/leaveRequestRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'ECO Grid Admin System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Something went wrong!' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;

// Connect to database first, then start server
const startServer = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api/staff`);
      console.log(`Leave Requests API available at http://localhost:${PORT}/api/leaverequests`);
      console.log(`Payments API available at http://localhost:${PORT}/api/payments`);
      console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // Don't exit, just log the error and continue
    console.log('Server will start without database connection...');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without database)`);
      console.log(`API available at http://localhost:${PORT}/api/staff`);
      console.log(`Leave Requests API available at http://localhost:${PORT}/api/leaverequests`);
      console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
    });
  }
};

startServer();
