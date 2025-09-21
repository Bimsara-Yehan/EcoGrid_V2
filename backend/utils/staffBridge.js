import mongoose from "mongoose";

export async function resolveStaffIdForUser(userId, staffType) {
  const col = mongoose.connection.collection("staffs");
  const q = { userId: new mongoose.Types.ObjectId(String(userId)) };
  if (staffType) q.staffType = staffType;
  const doc = await col.findOne(q, { projection: { _id: 1 } });
  return doc?._id || null;
}


