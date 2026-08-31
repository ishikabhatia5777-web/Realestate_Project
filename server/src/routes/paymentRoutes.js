const express = require('express');
const router = express.Router();
const { processPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

// Allow guest checkout for deposits
router.post('/checkout', processPayment);

router.use(protect);

router.get(
  '/history',
  authorize('super_admin', 'admin', 'agency', 'agent', 'seller', 'buyer'),
  getPaymentHistory
);

module.exports = router;
