const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const wasteCollectionRoutes = require('./routes/wasteCollection');
const recyclingGuideRoutes = require('./routes/recyclingGuide');
const userProfileRoutes = require('./routes/userProfile');
const reportsRoutes = require('./routes/reports');
const tasksRoutes = require('./routes/tasks');
const incineratorRoutes = require('./routes/incinerator');
const chatbotRoutes = require('./routes/chatbot');
const compostingRoutes = require('./routes/composting');
const reportingRoutes = require('./routes/reporting');
const specialRequestRoutes = require('./routes/specialRequests');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ ok: true });
});

// Database connection
//const DEFAULT_ATLAS_URI = 'mongodb+srv://Haritha:Haritha123@cluster0.7bzpi3q.mongodb.net/EcoGrid_V2?retryWrites=true&w=majority&appName=Cluster0';
const LOCAL_URI = 'mongodb://localhost:27017/EcoGrid_V2';

// Try Atlas first, fallback to local
const mongoURI = process.env.MONGODB_URI || DEFAULT_ATLAS_URI || LOCAL_URI;

const maskMongoUri = (uri) => {
    try {
        return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/i, '$1$2:****@');
    } catch (e) {
        return uri;
    }
};

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
.then(() => {
    const masked = maskMongoUri(mongoURI);
    const dbName = mongoose.connection.name;
    console.log(`Connected to MongoDB → ${masked} (db: ${dbName})`);
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Trying local MongoDB...');
    
    // Fallback to local MongoDB
    if (mongoURI !== LOCAL_URI) {
        mongoose.connect(LOCAL_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            const masked = maskMongoUri(LOCAL_URI);
            const dbName = mongoose.connection.name;
            console.log(`Connected to local MongoDB → ${masked} (db: ${dbName})`);
        })
        .catch(localErr => console.error('Local MongoDB connection error:', localErr));
    }
});

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/waste-collection', wasteCollectionRoutes);
app.use('/api/recycling-guide', recyclingGuideRoutes);
app.use('/api/user-profile', userProfileRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/incinerator', incineratorRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/composting', compostingRoutes);
app.use('/api/reporting', reportingRoutes);
app.use('/api/special-requests', specialRequestRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

