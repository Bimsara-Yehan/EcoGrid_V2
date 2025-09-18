import mongoose from "mongoose";

export async function connectDB(retries = 5) {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, { dbName: "ecogrid" });
      console.log("✅ Mongo connected");
      return;
    } catch (err) {
      console.error(`Mongo connect failed (attempt ${attempt}/${retries}): ${err.message}`);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}
