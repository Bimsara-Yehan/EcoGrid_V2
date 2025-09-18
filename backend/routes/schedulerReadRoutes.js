import { Router } from "express";
import { requireAuthMaybeDev } from "../utils/requireAuthMaybeDev.js";
import { getDepots, getFacilities, getCustomers, getBins, getIncidents, getDrivers } from "../controllers/schedulerReadController.js";

const router = Router();

router.get("/depots", requireAuthMaybeDev, getDepots);
router.get("/facilities", requireAuthMaybeDev, getFacilities);
router.get("/customers", requireAuthMaybeDev, getCustomers);
router.get("/bins", requireAuthMaybeDev, getBins);
router.get("/incidents", requireAuthMaybeDev, getIncidents);
router.get("/drivers", requireAuthMaybeDev, getDrivers);

export default router;









