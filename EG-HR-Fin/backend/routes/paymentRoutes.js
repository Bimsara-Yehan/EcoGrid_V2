const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  deletePayment
} = require('../controllers/paymentController');

router.route('/')
  .get(getAllPayments)
  .post(createPayment);

router.route('/:id')
  .get(getPaymentById)
  .put(updatePayment)
  .delete(deletePayment);

router.route('/:id/status')
  .put(updatePaymentStatus);

module.exports = router;


