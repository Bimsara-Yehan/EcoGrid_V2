const mongoose = require('mongoose');

const wasteLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  weight: { type: Number, required: true },
  category: { type: String, enum: ['perishable', 'non-perishable', 'hazardous', 'recyclable'], required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processed', 'disposed'], default: 'pending' },
  energyProduced: { type: Number, default: 0 }, // Energy output in units (e.g., kWh)
  emissions: { type: Number, default: 0 }, // Emissions in kg CO2
  // Composition map where keys are material names and values are percentages (0-100)
  composition: { type: Map, of: Number, default: {} },
  // AI Recommendation data
  aiRecommendation: {
    settings: {
      airflow: { type: Number },
      grate_speed: { type: Number },
      feed_rate: { type: Number },
      o2_target: { type: Number },
      burner_temp: { type: Number }
    },
    pred_energy: { type: Number },
    pred_emissions: { type: Number },
    accepted: { type: Boolean, default: false },
    acceptedAt: { type: Date }
  },
  // Fields required by the collection validator
  processingId: { type: mongoose.Schema.Types.ObjectId, required: true, default: () => new mongoose.Types.ObjectId() },
  raw: { type: mongoose.Schema.Types.Mixed, default: {} },
  exportedAt: { type: Date, default: null },
});

module.exports = mongoose.model('WasteLog', wasteLogSchema);