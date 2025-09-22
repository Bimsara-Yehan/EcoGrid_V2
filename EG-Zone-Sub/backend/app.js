// app.js
require('dotenv').config(); // load .env

const express = require("express");
const mongoose = require("mongoose");
const router = require("./Routes/ZoneRoute");
const SubRoute = require("./Routes/SubRoute");
const CustomerRoute = require("./Routes/CustomerRoute");

const app = express();

// middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running", timestamp: new Date().toISOString() });
});

// Namespace API to avoid clashing with frontend routes when refreshing
app.use("/api/Zones", router);
app.use("/api/subscriptions", SubRoute);
app.use("/api/customers", CustomerRoute);

// Standardized MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Validate environment variables
if (!MONGO_URI) {
  console.error("❌ MongoDB connection string not found!");
  console.error("Please set MONGODB_URI or MONGO_URI in your .env file");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Connect and then start server
console.log("Attempting to connect to MongoDB...");
console.log("MONGO_URI:", MONGO_URI ? "Set" : "Not set");

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Please check your MongoDB connection string and ensure the database is accessible");
    console.error("Full error:", err);
    process.exit(1);
  });



