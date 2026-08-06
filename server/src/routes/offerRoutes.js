const express = require('express');
const router = express.Router();
const { createOffer, getOffers, respondOffer } = require('../controllers/offerController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.post('/', createOffer);
router.get('/', getOffers);
router.put('/:id/respond', respondOffer);
router.patch('/:id/respond', respondOffer);

module.exports = router;
