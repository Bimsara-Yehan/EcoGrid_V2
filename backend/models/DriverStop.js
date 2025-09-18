import mongoose from "mongoose";

const driverStopSchema = new mongoose.Schema({
  date: { type: String, required: true },            // YYYY-MM-DD
  driverUid: { type: String, required: true },
  kind: { type: String, enum: ["household", "bin", "incident"], required: true },
  title: String,
  subtitle: String,
  coords: { type: [Number], required: true },        // [lat, lng]
  fill: Number,
  // planning/ordering
  seq: { type: Number, index: true },
  status: { type: String, enum: ["assigned", "collected", "skipped", "missed"], default: "assigned" },
  planId: { type: String },
  planVersion: { type: Number }
}, { timestamps: true });

driverStopSchema.index({ driverUid: 1, date: 1, seq: 1 });

export default mongoose.model("DriverStop", driverStopSchema);









