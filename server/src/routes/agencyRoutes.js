const express = require('express');
const router = express.Router();
const { getAgencies, getAgencyById, createAgency, getAgents } = require('../controllers/agencyController');
const { protect } = require('../middlewares/auth');

router.get('/', getAgencies);
router.get('/:id', getAgencyById);
router.post('/', protect, createAgency);

module.exports = router;
