const mongoose = require('mongoose');

const compostStationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    location: {
        lat: { type: Number, required: true, min: -90, max: 90 },
        lng: { type: Number, required: true, min: -180, max: 180 },
        address: { type: String, required: true, trim: true }
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'compost_station' });

compostStationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

compostStationSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('CompostStation', compostStationSchema);



