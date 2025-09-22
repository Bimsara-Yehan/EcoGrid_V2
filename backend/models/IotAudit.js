import mongoose from "mongoose";

const IotAuditSchema = new mongoose.Schema({
  at: { type: Date, default: () => new Date(), index: true },
  actorUid: { type: String },
  action: { type: String, required: true }, // e.g., device_disable, token_rotate
  target: { type: Object, default: {} },    // { deviceId, binId }
  meta: { type: Object, default: {} },
}, { collection: "iotaudits" });

export default mongoose.model("IotAudit", IotAuditSchema);




