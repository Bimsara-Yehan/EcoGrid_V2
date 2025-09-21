const mongoose = require('mongoose');

// Generic counter collection used for auto-incrementing numeric IDs
// Document key example: { _id: 'staffID', seq: 1000 }
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', counterSchema, 'counters');


