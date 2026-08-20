const express = require('express');
const router = express.Router();
const { 
  getAdminMetrics, 
  getUsers, 
  updateUserRole, 
  getAdminProperties,
  deleteAdminProperty,
  getAdminTransactions,
  getBlogs, 
  createBlog,
  getPendingProperties,
  approveProperty,
  rejectProperty,
  getActivityLogs,
  getAdminInquiries,
  uploadPropertiesCsv
} = require('../controllers/adminController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

router.get('/blogs', getBlogs);

router.use(protect);
router.use(authorize('super_admin', 'admin'));

router.get('/metrics', getAdminMetrics);
router.get('/users', getUsers);
router.put('/users/:id', updateUserRole);

router.get('/properties/pending', getPendingProperties);
router.get('/properties', getAdminProperties);
router.post('/properties/upload-csv', upload.single('file'), uploadPropertiesCsv);
router.delete('/properties/:id', deleteAdminProperty);
router.patch('/properties/:id/approve', approveProperty);
router.patch('/properties/:id/reject', rejectProperty);

router.get('/transactions', getAdminTransactions);
router.get('/inquiries', getAdminInquiries);
router.get('/logs', getActivityLogs);

router.post('/blogs', createBlog);

module.exports = router;
