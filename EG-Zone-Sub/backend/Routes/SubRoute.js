const express = require("express");
const router = express.Router();
const SubscriptionController = require("../Controllers/SubController");

console.log('SubscriptionController:', SubscriptionController); // Debug log
router.get("/", SubscriptionController.getAllSubscriptions);
router.get("/customers", SubscriptionController.getAllCustomerSubscriptions);
router.get("/zone/:zoneId", SubscriptionController.getSubscriptionsByZone);
router.get("/summary", SubscriptionController.getSummary);
router.get("/:id", SubscriptionController.getSubscriptionById);
router.post("/", SubscriptionController.addSubscription);
router.put("/:id", SubscriptionController.updateSubscription);
router.delete("/:id", SubscriptionController.deleteSubscription);
router.post("/:id/restore", SubscriptionController.restoreSubscription);
router.delete("/:id/permanent", SubscriptionController.permanentDeleteSubscription);



module.exports = router;