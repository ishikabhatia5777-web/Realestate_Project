const express = require('express');
const router = express.Router();
const { createBooking, getBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.post('/', createBooking);
router.get('/', getBookings);
router.put('/:id/status', updateBookingStatus);

module.exports = router;
