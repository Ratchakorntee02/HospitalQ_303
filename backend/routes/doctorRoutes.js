const express = require('express');
const router = express.Router();
const { getAllDoctors } = require('../controllers/doctorController');

// กำหนดเส้นทางแบบ GET (เพราะเป็นการร้องขอข้อมูล ไม่ได้ส่งข้อมูลไปบันทึก)
router.get('/', getAllDoctors);

module.exports = router;