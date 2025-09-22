const express = require("express");
const router = express.Router();

//Insert Model//
const Zone = require("../Model/ZoneModel");

//Insert Zone Controller 
const ZoneController = require("../Controllers/ZoneController");

router.get("/",ZoneController.getAllZones);
router.post("/",ZoneController.addZone);
router.get("/:id",ZoneController.getById);
router.put("/:id",ZoneController.UpdateZone);
router.delete("/:id",ZoneController.deleteZone);
router.get("/:id/customers", ZoneController.getCustomersForZone);

// Geometry update route
router.put("/:id/geometry", ZoneController.updateGeometry);

// Customer reassignment routes
router.post("/reassign-customers", ZoneController.reassignCustomersToZone);
router.get("/:zoneId/customers-in-zone", ZoneController.getCustomersInZone);

//export
module.exports = router;


