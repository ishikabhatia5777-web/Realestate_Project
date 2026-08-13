const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile, toggleWishlist } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/wishlist/:propertyId', protect, toggleWishlist);

module.exports = router;
