import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";
import PublicBin from "../models/PublicBin.js";

dotenv.config();

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function main() {
  const [, , binIdArg, deviceIdArg, tokenPlain] = process.argv;
  if (!binIdArg || !deviceIdArg || !tokenPlain) {
    console.log("Usage: node scripts/provisionDevice.js <binId> <deviceId> <deviceToken>");
    process.exit(1);
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not set");
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: process.env.DB_NAME || "ecogrid" });

  const tokenHash = sha256(tokenPlain);
  const res = await PublicBin.updateOne(
    { binId: binIdArg },
    { $set: { deviceId: deviceIdArg, deviceTokenHash: tokenHash } }
  );
  console.log("Updated:", res);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});




