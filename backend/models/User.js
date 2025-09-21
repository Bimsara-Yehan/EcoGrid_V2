import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  status: { type: String, enum: ["active", "blocked"], default: "active" },
  roles: { type: [String], default: [] },
  lastLoginAt: { type: Date, default: null }
}, { timestamps: true, collection: "users" });

export default mongoose.model("User", UserSchema);




