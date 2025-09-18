import mongoose from "mongoose";
const dropoffSchema = new mongoose.Schema(
  {
    date: { type: String, index: true },
    driverUid: { type: String, index: true },
    facility: String,
    weightKg: Number,
    time: Date,
    notes: String
  },
  { timestamps: true }
);
export default mongoose.model("Dropoff", dropoffSchema);
