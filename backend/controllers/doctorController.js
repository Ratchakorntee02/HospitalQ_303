const db = require('../config/db');

const getAllDoctors = async (req, res) => {
    try {
        // ใช้คำสั่ง SQL ดึงข้อมูลแพทย์ (เลือกเฉพาะรหัส, ชื่อ, และแผนก ไม่ดึงพาสเวิร์ดมาเพื่อความปลอดภัย)
        const [doctors] = await db.execute('SELECT doctor_id, name, department FROM Doctors');
        
        // ส่งข้อมูลกลับไปให้ Frontend
        res.status(200).json(doctors);
    } catch (error) {
        console.error("Error in getAllDoctors:", error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแพทย์' });
    }
};

module.exports = { getAllDoctors };