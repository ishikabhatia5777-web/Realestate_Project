const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  getSimilarProperties,
  generateAppraisal
} = require('../controllers/propertyController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.get('/:id/similar', getSimilarProperties);
router.post('/:id/appraisal', generateAppraisal);

router.post('/', protect, authorize('super_admin', 'admin', 'agency', 'agent', 'seller', 'owner'), createProperty);
router.put('/:id', protect, authorize('super_admin', 'admin', 'agency', 'agent', 'seller', 'owner'), updateProperty);
router.delete('/:id', protect, authorize('super_admin', 'admin', 'agency', 'agent', 'seller', 'owner'), deleteProperty);
router.patch('/:id/status', protect, authorize('super_admin', 'admin', 'agency', 'agent', 'seller'), updatePropertyStatus);

module.exports = router;
