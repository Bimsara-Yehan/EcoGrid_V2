// backend/routes/pickupRoutes.js
import express from "express";
import { createPickup, listPickups } from "../controllers/pickupsController.js";
import { requireAuthMaybeDev } from "../utils/requireAuthMaybeDev.js";

const router = express.Router();

// Accepts JSON { stopId, action, photoUrl? }
router.post("/", requireAuthMaybeDev, createPickup);
router.post("/", createPickup);      // POST /api/pickups
router.get("/", listPickups);        // GET  /api/pickups?date=YYYY-MM-DD


export default router;
