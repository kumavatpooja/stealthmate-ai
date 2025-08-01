
const express = require('express');
const router = express.Router();
const { saveUserPlan } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/save-plan', authMiddleware, saveUserPlan);

module.exports = router;
