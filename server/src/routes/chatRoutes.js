const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, sendGuestMessage, getInbox, markThreadRead, getExpertRequests, markExpertRequestRead } = require('../controllers/chatController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/rbac');

router.post('/guest', sendGuestMessage);

router.use(protect);
router.get('/inbox', getInbox);
router.patch('/read/:senderId', markThreadRead);
router.get('/expert-requests', authorize('agent', 'agency', 'seller', 'owner', 'admin', 'super_admin'), getExpertRequests);
router.patch('/expert-requests/:id/read', authorize('agent', 'agency', 'seller', 'owner', 'admin', 'super_admin'), markExpertRequestRead);
router.get('/:receiverId', getMessages);
router.post('/', sendMessage);

module.exports = router;
