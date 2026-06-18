const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const app = express();

// อนุญาตให้ Frontend สื่อสารกับ Backend ได้
app.use(cors());
// ให้ระบบรับส่งข้อมูลแบบ JSON ได้
app.use(express.json());

// API พื้นฐานสำหรับทดสอบว่า Server ทำงานปกติ
app.get('/', (req, res) => {
    res.send('Backend Hospital Queue is running!');
});

// นำเข้าเส้นทาง API ของระบบสมาชิก
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// นำเข้าเส้นทาง API ของระบบแพทย์
const doctorRoutes = require('./routes/doctorRoutes');
app.use('/api/doctors', doctorRoutes);

// นำเข้าเส้นทาง API ของระบบการจองคิว
const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// เปิดการทำงานของ Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
