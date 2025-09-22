import mongoose from "mongoose";

const StatusSchema = new mongoose.Schema(
  {
    fillPct: { type: Number, default: 0 },
    needsPickup: { type: Boolean, default: false },
    ts: { type: Date, default: null },
    consecHigh: { type: Number, default: 0 },
  },
  { _id: false }
);

const PublicBinSchema = new mongoose.Schema(
  {
    binId: { type: String, required: true, index: true },
    deviceId: { type: String, index: true },
    deviceTokenHash: { type: String, select: false },
    geo: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    status: { type: StatusSchema, default: () => ({}) },
  },
  { timestamps: true, strict: false, collection: "publicbins" }
);

export default mongoose.models.PublicBin || mongoose.model("PublicBin", PublicBinSchema);




