import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || "ecogrid";
if (!uri) {
  console.error("MONGO_URI missing");
  process.exit(1);
}

const usersCol = () => mongoose.connection.collection("users");
const staffsCol = () => mongoose.connection.collection("staffs");

async function upsertUser(email, roles, passwordPlain) {
  const passwordHash = await bcrypt.hash(passwordPlain, 10);
  const now = new Date();
  const result = await usersCol().findOneAndUpdate(
    { email },
    {
      $setOnInsert: { createdAt: now },
      $set: { email, roles, status: "active", passwordHash, updatedAt: now }
    },
    { upsert: true, returnDocument: "after" }
  );
  return result.value;
}

async function ensureStaffForUser(userId, name, staffType, extras = {}) {
  const now = new Date();
  const result = await staffsCol().findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    {
      $setOnInsert: { createdAt: now, name },
      $set: { updatedAt: now, staffType, name, ...extras }
    },
    { upsert: true, returnDocument: "after" }
  );
  return result.value;
}

async function main() {
  await mongoose.connect(uri, { dbName });
  console.log("✅ Connected", dbName);

  // Samples
  const driver = await upsertUser("driver@example.com", ["driver"], "Passw0rd!");
  const scheduler = await upsertUser("scheduler@example.com", ["scheduler"], "Passw0rd!");
  const dual = await upsertUser("both@example.com", ["driver","scheduler"], "Passw0rd!");

  const drvStaff = await ensureStaffForUser(driver._id, "Sample Driver", "driver", { phone: "0700000000" });
  const schStaff = await ensureStaffForUser(scheduler._id, "Sample Scheduler", "scheduler", { phone: "0700000001" });
  const dualDrv = await ensureStaffForUser(dual._id, "Dual User", "driver", { phone: "0700000002" });

  console.log("Users:", {
    driver: { id: String(driver._id), email: driver.email },
    scheduler: { id: String(scheduler._id), email: scheduler.email },
    both: { id: String(dual._id), email: dual.email }
  });
  console.log("Staffs:", {
    driver: { id: String(drvStaff._id), userId: String(drvStaff.userId), staffType: drvStaff.staffType },
    scheduler: { id: String(schStaff._id), userId: String(schStaff.userId), staffType: schStaff.staffType },
    both_driver: { id: String(dualDrv._id), userId: String(dualDrv.userId), staffType: dualDrv.staffType },
  });

  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});



