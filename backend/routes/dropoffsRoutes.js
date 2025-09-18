import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createDropoff } from "../controllers/dropoffsController.js";

const router = Router();
router.post("/", requireAuth, createDropoff);
export default router;
