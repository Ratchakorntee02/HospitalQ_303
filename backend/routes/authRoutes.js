const express = require('express');
const router = express.Router();
// ดึงฟังก์ชัน register จาก controller มาใช้งาน
const { register, login } = require('../controllers/authController');

// กำหนดเส้นทางแบบ POST (ใช้สำหรับการส่งข้อมูลมาบันทึก)
router.post('/register', register);
router.post('/login', login);

module.exports = router;