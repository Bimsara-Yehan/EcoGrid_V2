
const mongoose = require('mongoose');

const geoSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: arr => Array.isArray(arr) && arr.length === 2,
      message: 'Coordinates must be an array of two numbers.'
    }
  }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  label: { type: String },
  addressLine: { type: String },
  geo: { type: geoSchema, required: true },
  zoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', default: null }
}, { _id: false });

const ecopointsTransactionSchema = new mongoose.Schema({
  ts: { type: Date, required: true },
  delta: { type: Number, required: true },
  reason: { type: String, required: true },
  ref: {
    type: new mongoose.Schema({
      type: { type: String },
      id: { type: mongoose.Schema.Types.ObjectId, default: null }
    }, { _id: false }),
    default: undefined
  }
}, { _id: false });

const customerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  fullName: { type: String, required: true },
  phones: [{ type: String }],
  addresses: [addressSchema],
  activeSubscriptionId: { type: mongoose.Schema.Types.ObjectId, default: null },
  ecopointsBalance: { type: Number },
  ecopointsTransactions: [ecopointsTransactionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);


