const express = require('express');
const router = express.Router();
const { getAdminSummary } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/summary', verifyToken, getAdminSummary);

module.exports = router;
