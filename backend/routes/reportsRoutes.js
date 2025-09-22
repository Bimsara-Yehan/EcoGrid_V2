import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDailyReport, getDailyReportPdf } from "../controllers/reportsController.js";

const router = express.Router();

// JSON daily report: /api/reports/daily?date=YYYY-MM-DD
router.get("/daily", requireAuth, getDailyReport);

// PDF daily report: /api/reports/daily.pdf?date=YYYY-MM-DD
router.get("/daily.pdf", requireAuth, getDailyReportPdf);

export default router;
