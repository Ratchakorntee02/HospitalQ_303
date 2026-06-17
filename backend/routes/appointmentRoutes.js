// นำเข้าแพ็กเกจ 'express' เพื่อใช้งานฟีเจอร์สร้างเส้นทาง (Routing)
const express = require('express');
// สร้างตัวแปร 'router' เพื่อเป็นตัวจัดการเส้นทาง API ย่อยๆ ในระบบจองคิว
const router = express.Router();
// นำเข้าฟังก์ชันการทำงานต่างๆ (Logic) จากไฟล์ 'appointmentController.js' มาเตรียมไว้
const { bookAppointment, getPatientAppointments, cancelAppointment, getDoctorAppointments, completeAppointment, getDailyReport, rescheduleAppointment, getDoctorAlert} = require('../controllers/appointmentController');
// นำเข้าฟังก์ชัน 'verifyToken' (ยาม) จากไฟล์ 'authMiddleware.js' เพื่อใช้ตรวจบัตร (Token)
const { verifyToken } = require('../middleware/authMiddleware');
// กำหนดเส้นทาง POST สำหรับจองคิว โดยดัก 'verifyToken' ไว้ตรงกลางเพื่อตรวจสิทธิ์ก่อนจอง
router.post('/book', verifyToken, bookAppointment);

// กำหนดเส้นทาง GET สำหรับดูประวัติการจองของผู้ป่วย (รับรหัสคนไข้ :patient_id ผ่าน URL)
router.get('/patient/:patient_id', getPatientAppointments);
// กำหนดเส้นทาง PUT สำหรับยกเลิกคิว (รับรหัสคิว :appointment_id ผ่าน URL)
router.put('/cancel/:appointment_id', cancelAppointment);
// กำหนดเส้นทาง GET สำหรับแพทย์ดูรายการคิวของตนเอง (รับรหัสหมอ :doctor_id ผ่าน URL)
router.get('/doctor/:doctor_id', getDoctorAppointments);
// กำหนดเส้นทาง PUT สำหรับแพทย์กดจบงาน/เปลี่ยนสถานะเป็นเสร็จสิ้น (รับรหัสคิว :appointment_id ผ่าน URL)
router.put('/complete/:appointment_id', completeAppointment);
// กำหนดเส้นทาง GET สำหรับเรียกดูรายงานสรุปยอดรายวัน (รับรหัสหมอ :doctor_id และวันที่ :date ผ่าน URL)
router.get('/report/:doctor_id/:date', getDailyReport);
// กำหนดเส้นทางแบบ PUT สำหรับเลื่อนคิว (ต้องตรวจบัตร verifyToken ก่อน)
router.put('/reschedule/:appointment_id', verifyToken, rescheduleAppointment);
// กำหนดเส้นทางแบบ GET สำหรับเช็คยอดคิวแจ้งเตือนหมอประจำวัน
router.get('/doctor/:doctor_id/alert', getDoctorAlert);

// ส่งออกตัวแปร 'router' ทั้งหมดนี้ เพื่อให้ไฟล์หลัก (server.js) สามารถดึงไปเชื่อมต่อได้
module.exports = router;