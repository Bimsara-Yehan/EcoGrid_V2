// app.js
require('dotenv').config(); // load .env

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router = require("./routes/ZoneRoute");
const SubRoute = require("./routes/SubRoute");
const CustomerRoute = require("./routes/CustomerRoute");

const app = express();

// middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "15mb" }));

// Namespace API to avoid clashing with frontend routes when refreshing
app.use("/api/Zones", router);
app.use("/api/subscriptions", SubRoute);
app.use("/api/customers", CustomerRoute);

// Build MONGO_URI either from full MONGO_URI or from parts
const MONGO_URI = process.env.MONGO_URI || (() => {
  const user = process.env.MONGO_USER;
  const pass = process.env.MONGO_PASS ? encodeURIComponent(process.env.MONGO_PASS) : "";
  const cluster = process.env.MONGO_CLUSTER;
  const db = process.env.MONGO_DB;
  return `mongodb+srv://${user}:${pass}@${cluster}/${db}?retryWrites=true&w=majority`;
})();

const PORT = process.env.PORT || 5000;

// Connect and then start server
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });