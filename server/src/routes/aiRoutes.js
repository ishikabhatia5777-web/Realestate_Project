const express = require('express');
const router = express.Router();
const { generateDescription, getValuation, checkFraud, aiChat } = require('../controllers/aiController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.post('/generate-description', protect, authorize('super_admin', 'admin', 'agent', 'agency', 'seller', 'owner'), generateDescription);
router.post('/valuation', getValuation);
router.post('/fraud-check', checkFraud);
router.post('/chat', aiChat);

module.exports = router;
