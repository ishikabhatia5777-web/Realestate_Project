const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile, toggleWishlist, forgotPassword, verifyOtp } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/wishlist/:propertyId', protect, toggleWishlist);
router.post('/forgotpassword', forgotPassword);
router.post('/verify-otp', verifyOtp);
module.exports = router;
