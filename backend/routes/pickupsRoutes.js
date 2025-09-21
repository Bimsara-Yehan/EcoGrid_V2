// backend/routes/pickupRoutes.js
import express from "express";
import { createPickup, listPickups } from "../controllers/pickupsController.js";
import { requireAuthMaybeDev } from "../utils/requireAuthMaybeDev.js";

const router = express.Router();

// Accepts JSON { stopId, action, photoUrl? }
router.post("/", requireAuthMaybeDev, createPickup); // POST /api/pickups
router.get("/", requireAuthMaybeDev, listPickups);   // GET  /api/pickups?date=YYYY-MM-DD


export default router;
