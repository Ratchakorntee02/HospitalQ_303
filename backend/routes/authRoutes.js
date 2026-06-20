const express = require('express');
const router = express.Router();
// ดึงฟังก์ชัน register จาก controller มาใช้งาน
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// กำหนดเส้นทางแบบ POST (ใช้สำหรับการส่งข้อมูลมาบันทึก)
router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;