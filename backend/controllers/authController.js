const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
    try {
        // 1. รับข้อมูลที่ส่งมาจากหน้าเว็บ (Frontend)
        const {
            name,
            phone,
            citizen_id,
            email,
            password,
            birth_date,
            gender,
            blood_type,
            allergies,
            chronic_diseases,
            current_medications,
            emergency_contact_name,
            emergency_contact_phone
        } = req.body;
        
        // 2. สร้าง patient_id แบบสุ่มง่ายๆ โดยใช้ตัว P นำหน้าตามด้วยตัวเลขเวลา
        const patient_id = 'P' + Date.now();

        // 3. เตรียมคำสั่ง SQL สำหรับเพิ่มข้อมูลลงตาราง Patients
        const sql = `INSERT INTO Patients (
                        patient_id, name, phone, citizen_id, email, password, birth_date,
                        gender, blood_type, allergies, chronic_diseases,
                        current_medications, emergency_contact_name, emergency_contact_phone
                     ) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        // 4. สั่งรัน SQL พร้อมยัดข้อมูลลงไป
        await db.execute(sql, [
            patient_id,
            name,
            phone,
            citizen_id,
            email,
            password,
            birth_date || null,
            gender || null,
            blood_type || null,
            allergies || null,
            chronic_diseases || null,
            current_medications || null,
            emergency_contact_name || null,
            emergency_contact_phone || null
        ]);

        // 5. ส่งข้อความกลับไปบอกหน้าเว็บว่าทำสำเร็จแล้ว
        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จเรียบร้อย!' });
        
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
    }
};

const login = async (req, res) => {
    try {
        // 1. รับอีเมลและรหัสผ่านจากหน้าเว็บ
        const { email, password } = req.body;

        // 2. ค้นหาในตาราง Patients ก่อน
        let [users] = await db.execute('SELECT * FROM Patients WHERE email = ?', [email]);
        let role = 'patient';

        // 3. ถ้าไม่เจอใน Patients ให้ไปหาในตาราง Doctors
        if (users.length === 0) {
            [users] = await db.execute('SELECT * FROM Doctors WHERE email = ?', [email]);
            role = 'doctor';
        }

        if (users.length === 0) {
            [users] = await db.execute('SELECT * FROM Admins WHERE email = ?', [email]);
            role = 'admin';
        }

        // 4. ถ้าหาไม่เจอทั้งสองตาราง แปลว่าอีเมลผิด
        if (users.length === 0) {
            return res.status(401).json({ error: 'อีเมลไม่ถูกต้อง หรือไม่มีในระบบ' });
        }

        const user = users[0];

        // 5. ตรวจสอบรหัสผ่าน
        if (user.password !== password) {
            return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
        }
        
        // 6. ล็อกอินสำเร็จ -> สร้าง JWT Token (บัตรผ่าน)
        const token = jwt.sign(
            { 
                id: role === 'patient' ? user.patient_id : role === 'doctor' ? user.doctor_id : user.admin_id,
                role: role 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } // บัตรนี้มีอายุ 1 วัน
        );

        // 7. ส่งข้อมูลพร้อม Token กลับไปให้ Frontend
        res.status(200).json({
            message: 'เข้าสู่ระบบสำเร็จ!',
            token: token, // <--- สิ่งที่เพิ่มเข้ามา!
            role: role,
            user: {
                id: role === 'patient' ? user.patient_id : role === 'doctor' ? user.doctor_id : user.admin_id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
    }
};

// ส่งออกฟังก์ชันไปให้ไฟล์อื่นใช้งาน
module.exports = { register, login };
