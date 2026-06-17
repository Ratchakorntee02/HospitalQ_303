const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    // 1. รับค่าจาก Header ที่ชื่อว่า Authorization (รูปแบบ: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. ถ้าไม่มี Token ส่งมา (ไม่มีบัตร)
    if (!token) {
        return res.status(401).json({ error: 'Access Denied! ปฏิเสธการเข้าถึง โปรดเข้าสู่ระบบก่อน' });
    }

    // 3. ตรวจสอบความถูกต้องของ Token ด้วยรหัสลับ
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token ไม่ถูกต้อง หรือหมดอายุแล้ว โปรดล็อกอินใหม่' });
        }

        // 4. ถ้าบัตรจริง! เก็บข้อมูล (id, role) ไว้ใน req.user เพื่อให้ฟังก์ชันอื่นเอาไปใช้ต่อได้
        req.user = decoded;
        next(); // เปิดประตูให้ไปทำงานต่อ (เช่น ไปจองคิว, ไปดูประวัติ)
    });
};

module.exports = { verifyToken };