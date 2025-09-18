import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import stopsRoutes from "./routes/stopsRoutes.js";  
import reportsRoutes from "./routes/reportsRoutes.js";
import pickupsRoutes from "./routes/pickupsRoutes.js";
import dropoffsRoutes from "./routes/dropoffsRoutes.js";
import schedulerRoutes from "./routes/schedulerRoutes.js";
import schedulerReadRoutes from "./routes/schedulerReadRoutes.js";
import { seedSchedulerData } from "./seed/seedSchedulerData.js";



dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "15mb" }));

await connectDB();
await seedSchedulerData();

app.use((req, res, next) => {
  console.log("⇢", req.method, req.url);
  next();
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/stops", stopsRoutes);

app.use("/api/reports", reportsRoutes);

app.use("/api/pickups", pickupsRoutes);

app.use("/api/dropoffs", dropoffsRoutes);



app.use("/api/scheduler", schedulerRoutes);
app.use("/api/scheduler", schedulerReadRoutes);


const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => console.log(`🚀 API listening on http://${HOST}:${PORT}`));
