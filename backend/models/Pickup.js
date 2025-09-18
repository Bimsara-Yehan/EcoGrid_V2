// backend/models/Pickup.js
import mongoose from "mongoose";

const PickupSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },          
    driverUid: { type: String, required: true },
    stopId: { type: mongoose.Schema.Types.ObjectId, ref: "Stop", required: true },
    action: { type: String, enum: ["collected", "missed", "skipped"], required: true },
    // NEW
    reason: { type: String },                          
    photoUrl: { type: String },                        
    location: {                                        
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { timestamps: true, collection: "driver_pickups" }
);

export default mongoose.model("Pickup", PickupSchema);

