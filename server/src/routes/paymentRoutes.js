const express = require('express');
const router = express.Router();
const { processPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.use(protect);

// Payment permissions granted exclusively to authorized user roles
router.post(
  '/checkout',
  authorize('super_admin', 'admin', 'agency', 'agent', 'seller', 'buyer'),
  processPayment
);

router.get(
  '/history',
  authorize('super_admin', 'admin', 'agency', 'agent', 'seller', 'buyer'),
  getPaymentHistory
);

module.exports = router;
