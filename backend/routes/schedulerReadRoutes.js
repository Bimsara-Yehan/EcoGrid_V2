import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRoles } from "../middleware/auth.js";
import { getDepots, getFacilities, getCustomers, getBins, getIncidents, getDrivers } from "../controllers/schedulerReadController.js";

const router = Router();

router.get("/depots", requireAuth, requireRoles("scheduler"), getDepots);
router.get("/facilities", requireAuth, requireRoles("scheduler"), getFacilities);
router.get("/customers", requireAuth, requireRoles("scheduler"), getCustomers);
router.get("/bins", requireAuth, requireRoles("scheduler"), getBins);
router.get("/incidents", requireAuth, requireRoles("scheduler"), getIncidents);
router.get("/drivers", requireAuth, requireRoles("scheduler"), getDrivers);

export default router;












