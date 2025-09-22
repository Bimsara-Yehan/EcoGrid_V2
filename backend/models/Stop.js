import mongoose from "mongoose";
const stopSchema = new mongoose.Schema({
  // Existing driver app fields
  date: { type: String, required: true },            // YYYY-MM-DD
  driverUid: { type: String, required: true },
  kind: { type: String, enum: ["household", "bin", "incident"], required: true },
  title: String,
  subtitle: String,
  coords: { type: [Number], required: true },        // [lat, lng]
  fill: Number,

  // Collection validator fields in EcoGrid_V2.stops
  routeId: { type: mongoose.Schema.Types.ObjectId },
  seq: { type: Number, index: true },                // 1-based order within driver+date
  type: { type: String, enum: ["household", "public_bin", "public_litter_spot", "special_collection"] },
  geo: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: { type: [Number], default: undefined } // [lng, lat]
  },
  status: { type: String, enum: ["assigned", "collected", "skipped", "missed"], default: "assigned" },
  customerId: { type: mongoose.Schema.Types.ObjectId, default: null },
  address: { type: String },
  pickupId: { type: mongoose.Schema.Types.ObjectId, default: null },
  notes: { type: String },
  meta: { type: Object },

  // Planning metadata (optional)
  planId: { type: String },
  planVersion: { type: Number }
}, { timestamps: true });

stopSchema.index({ driverUid: 1, date: 1 });
stopSchema.index({ driverUid: 1, date: 1, seq: 1 });
export default mongoose.model("Stop", stopSchema);
