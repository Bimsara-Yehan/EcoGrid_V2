import mongoose from "mongoose";

const BinReadingSchema = new mongoose.Schema(
  {
    binId: { type: String, required: true, index: true },
    ts: { type: Date, required: true },
    fillPct: { type: Number, required: true, min: 0, max: 100 },
    battery: { type: Number },
    temp: { type: Number },
    geo: {
      type: { type: String, enum: ["Point"], required: false },
      coordinates: { type: [Number], required: false },
    },
  },
  { timestamps: true, strict: false, collection: "binreadings" }
);

export default mongoose.models.BinReading || mongoose.model("BinReading", BinReadingSchema);




