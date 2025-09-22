import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getStops } from "../controllers/stopsController.js";

const router = Router();
router.get("/", requireAuth, getStops);

export default router;
