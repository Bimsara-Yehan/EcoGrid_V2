import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRoles } from "../middleware/auth.js";
import { publishPlan } from "../controllers/schedulerController.js";

const router = Router();

// POST /api/scheduler/publish — scheduler only
router.post("/publish", requireAuth, requireRoles("scheduler"), publishPlan);

export default router;









