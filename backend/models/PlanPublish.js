import mongoose from "mongoose";

const planPublishSchema = new mongoose.Schema({
  planId: { type: String, required: true },
  planVersion: { type: Number, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  note: { type: String },
}, { timestamps: true });

planPublishSchema.index({ planId: 1, planVersion: 1 }, { unique: true });

export default mongoose.model("PlanPublish", planPublishSchema);












