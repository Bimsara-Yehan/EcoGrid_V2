import { Router } from "express";
import { requireAuthMaybeDev } from "../utils/requireAuthMaybeDev.js";
import { publishPlan } from "../controllers/schedulerController.js";

const router = Router();

// POST /api/scheduler/publish — publishes planned routes (dev auth for now)
router.post("/publish", requireAuthMaybeDev, publishPlan);

export default router;






