const db = require('../config/db');

const ACTIVE_STATUS = 'confirmed';
const COMPLETED_STATUS = 'completed';
const CANCELLED_STATUS = 'cancelled';

const formatQueueNo = (index) => `Q${String(index + 1).padStart(3, '0')}`;

const toSqlDate = (value) => {
    if (!value) return value;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return String(value).slice(0, 10);
};

const attachQueueMeta = async (appointments) => {
    const rows = Array.isArray(appointments) ? appointments : [];

    for (const appointment of rows) {
        const appointmentDate = toSqlDate(appointment.appointment_date);
        const [queueRows] = await db.execute(
            `SELECT appointment_id, status
             FROM Appointments
             WHERE doctor_id = ?
               AND appointment_date = ?
               AND status <> ?
             ORDER BY appointment_time ASC, appointment_id ASC`,
            [appointment.doctor_id, appointmentDate, CANCELLED_STATUS]
        );

        const myIndex = queueRows.findIndex((item) => item.appointment_id === appointment.appointment_id);
        const firstConfirmedIndex = queueRows.findIndex((item) => item.status === ACTIVE_STATUS);
        const confirmedBeforeMe = myIndex > -1
            ? queueRows.slice(0, myIndex).filter((item) => item.status === ACTIVE_STATUS).length
            : 0;

        appointment.queue_no = myIndex > -1 ? formatQueueNo(myIndex) : '-';
        appointment.calling_queue = firstConfirmedIndex > -1 ? formatQueueNo(firstConfirmedIndex) : '-';
        appointment.queues_ahead = appointment.status === ACTIVE_STATUS ? confirmedBeforeMe : 0;
        appointment.total_queues = queueRows.length;
        appointment.completed_queues = queueRows.filter((item) => item.status === COMPLETED_STATUS).length;
        appointment.estimated_wait_time = appointment.queues_ahead * 15;
    }

    return rows;
};

const bookAppointment = async (req, res) => {
    try {
        const { patient_id, doctor_id, appointment_date, appointment_time, current_symptoms } = req.body;

        if (req.user.role !== 'patient' || req.user.id !== patient_id) {
            return res.status(403).json({ error: 'You can only book an appointment for your own account.' });
        }

        if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
            return res.status(400).json({ error: 'Please select doctor, date, and time before booking.' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(appointment_date);
        selectedDate.setHours(0, 0, 0, 0);

        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 7);

        if (Number.isNaN(selectedDate.getTime())) {
            return res.status(400).json({ error: 'Invalid appointment date.' });
        }

        if (selectedDate < today) {
            return res.status(400).json({ error: 'Cannot book an appointment in the past.' });
        }

        if (selectedDate > maxDate) {
            return res.status(400).json({ error: 'Appointments can be booked up to 7 days in advance only.' });
        }

        const selectedDateTime = new Date(`${appointment_date}T${appointment_time}`);
        if (selectedDateTime <= new Date()) {
            return res.status(400).json({ error: 'Cannot book a time that has already passed.' });
        }

        const checkPatientSql = `
            SELECT * FROM Appointments
            WHERE patient_id = ?
              AND appointment_date = ?
              AND status = ?
        `;
        const [existingPatientQueue] = await db.execute(checkPatientSql, [patient_id, appointment_date, ACTIVE_STATUS]);

        if (existingPatientQueue.length > 0) {
            return res.status(400).json({ error: 'You already have an active appointment on this date.' });
        }

        const checkDoctorTimeSql = `
            SELECT * FROM Appointments
            WHERE doctor_id = ?
              AND appointment_date = ?
              AND appointment_time = ?
              AND status = ?
        `;
        const [existingDoctorTime] = await db.execute(checkDoctorTimeSql, [doctor_id, appointment_date, appointment_time, ACTIVE_STATUS]);

        if (existingDoctorTime.length > 0) {
            return res.status(400).json({ error: 'This time slot is already booked. Please choose another time.' });
        }

        const [scheduleRows] = await db.execute(
            `SELECT max_queue FROM Schedules
             WHERE doctor_id = ? AND available_date = ? AND available_time = ?
             LIMIT 1`,
            [doctor_id, appointment_date, appointment_time]
        );
        const maxQueue = scheduleRows[0]?.max_queue || 3;

        const [doctorDailyQueues] = await db.execute(
            `SELECT COUNT(*) AS total FROM Appointments
             WHERE doctor_id = ? AND appointment_date = ? AND status = ?`,
            [doctor_id, appointment_date, ACTIVE_STATUS]
        );

        if ((doctorDailyQueues[0]?.total || 0) >= maxQueue) {
            return res.status(400).json({ error: `This doctor is fully booked for the selected date. Maximum queue is ${maxQueue}.` });
        }

        const appointment_id = 'A' + Date.now();
        const insertSql = `
            INSERT INTO Appointments (appointment_id, patient_id, doctor_id, appointment_date, appointment_time, current_symptoms, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(insertSql, [appointment_id, patient_id, doctor_id, appointment_date, appointment_time, current_symptoms || '-', ACTIVE_STATUS]);

        await db.execute(
            `INSERT INTO Notifications (notification_id, doctor_id, appointment_id, message, status)
             VALUES (?, ?, ?, ?, 'unread')`,
            [
                'N' + Date.now(),
                doctor_id,
                appointment_id,
                `New appointment ${appointment_id} on ${appointment_date} at ${appointment_time}`
            ]
        );

        const [queueMetaRows] = await db.execute(
            `SELECT appointment_id, patient_id, doctor_id, DATE_FORMAT(appointment_date, '%Y-%m-%d') AS appointment_date, appointment_time, status
             FROM Appointments
             WHERE appointment_id = ?`,
            [appointment_id]
        );
        const [createdAppointment] = await attachQueueMeta(queueMetaRows);

        res.status(201).json({
            message: 'Appointment booked successfully!',
            appointment_id,
            queue_no: createdAppointment?.queue_no || appointment_id,
            appointment: { appointment_id, patient_id, doctor_id, appointment_date, appointment_time, current_symptoms, queue_no: createdAppointment?.queue_no || appointment_id }
        });

    } catch (error) {
        console.error('Error in bookAppointment:', error);
        res.status(500).json({ error: 'Failed to book appointment.' });
    }
};

const getPatientAppointments = async (req, res) => {
    try {
        const { patient_id } = req.params;

        if (req.user && req.user.role === 'patient' && req.user.id !== patient_id) {
            return res.status(403).json({ error: 'You can only view your own booking history.' });
        }
        const sql = `
            SELECT a.appointment_id,
                   a.doctor_id,
                   DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
                   a.appointment_time,
                   a.current_symptoms,
                   a.status,
                   d.name AS doctor_name,
                   d.department
            FROM Appointments a
            JOIN Doctors d ON a.doctor_id = d.doctor_id
            WHERE a.patient_id = ?
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `;

        const [appointments] = await db.execute(sql, [patient_id]);
        res.status(200).json(await attachQueueMeta(appointments));
    } catch (error) {
        console.error('Error in getPatientAppointments:', error);
        res.status(500).json({ error: 'Failed to load appointment history.' });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { appointment_id } = req.params;
        
        const checkSql = `
            SELECT status, patient_id, doctor_id,
                   TIMESTAMPDIFF(MINUTE, NOW(), TIMESTAMP(appointment_date, appointment_time)) AS minutes_left
            FROM Appointments
            WHERE appointment_id = ?
        `;
        const [appointments] = await db.execute(checkSql, [appointment_id]);

        if (appointments.length === 0) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        const appointment = appointments[0];

        if (req.user.role === 'patient' && appointment.patient_id !== req.user.id) {
            return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ยกเลิกคิวของผู้อื่น!' });
        }
        
        if (req.user.role === 'doctor' && appointment.doctor_id !== req.user.id) {
            return res.status(403).json({ error: 'คุณไม่มีสิทธิ์จัดการคิวของแพทย์ท่านอื่น!' });
        }

        if (appointment.status !== ACTIVE_STATUS) {
            return res.status(400).json({
                error: 'This appointment cannot be cancelled.'
            });
        }

        if (appointment.minutes_left < 60) {
            return res.status(400).json({
                error: 'Appointments must be cancelled at least 1 hour before the scheduled time.'
            });
        }

        await db.execute(
            'UPDATE Appointments SET status = ? WHERE appointment_id = ?',
            [CANCELLED_STATUS, appointment_id]
        );

        res.status(200).json({ message: 'Appointment cancelled successfully.' });
    } catch (error) {
        console.error('Error in cancelAppointment:', error);
        res.status(500).json({ error: 'Failed to cancel appointment.' });
    }
};

const getDoctorAppointments = async (req, res) => {
    try {
        const { doctor_id } = req.params;

        if (req.user?.role !== 'doctor' || req.user?.id !== doctor_id) {
            return res.status(403).json({ error: 'You can only view appointments assigned to your doctor account.' });
        }

        const sql = `
            SELECT a.appointment_id,
                   a.doctor_id,
                   DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
                   a.appointment_time,
                   a.current_symptoms,
                   a.status,
                   p.name AS patient_name,
                   p.phone,
                   p.citizen_id,
                   p.blood_type,
                   p.allergies,
                   p.chronic_diseases,
                   p.current_medications,
                   p.emergency_contact_name,
                   p.emergency_contact_phone,
                   TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) AS patient_age
            FROM Appointments a
            JOIN Patients p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = ?
            ORDER BY a.appointment_date ASC, a.appointment_time ASC
        `;

        const [appointments] = await db.execute(sql, [doctor_id]);
        res.status(200).json(await attachQueueMeta(appointments));
    } catch (error) {
        console.error('Error in getDoctorAppointments:', error);
        res.status(500).json({ error: 'Failed to load doctor appointments.' });
    }
};
const completeAppointment = async (req, res) => {
    try {
        const { appointment_id } = req.params;
        
        // เพิ่มการดึง doctor_id มาจากฐานข้อมูลเพื่อเอามาเช็คสิทธิ์ด้วย
        const [appointments] = await db.execute(
            'SELECT status, doctor_id FROM Appointments WHERE appointment_id = ?',
            [appointment_id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        // 🚨 1. เช็คว่าเป็น "คนไข้" แอบมากดหรือเปล่า
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ error: 'เฉพาะแพทย์เท่านั้นที่สามารถกดเสร็จสิ้นคิวได้!' });
        }

        // 🚨 2. เช็คว่าเป็น "หมอคนอื่น" แอบมากดคิวที่ไม่ใช่ของตัวเองหรือเปล่า
        if (appointments[0].doctor_id !== req.user.id) {
            return res.status(403).json({ error: 'คุณไม่มีสิทธิ์จัดการคิวของแพทย์ท่านอื่น!' });
        }

        if (appointments[0].status !== ACTIVE_STATUS) {
            return res.status(400).json({
                error: 'Only confirmed appointments can be completed.'
            });
        }

        await db.execute(
            'UPDATE Appointments SET status = ? WHERE appointment_id = ?',
            [COMPLETED_STATUS, appointment_id]
        );

        res.status(200).json({ message: 'Appointment completed successfully.' });
    } catch (error) {
        console.error('Error in completeAppointment:', error);
        res.status(500).json({ error: 'Failed to complete appointment.' });
    }
};

const getDailyReport = async (req, res) => {
    try {
        const { doctor_id, date } = req.params;

        if (req.user?.role !== 'doctor' || req.user?.id !== doctor_id) {
            return res.status(403).json({ error: 'You can only view your own daily report.' });
        }

        const sql = `
            SELECT status, COUNT(*) AS count
            FROM Appointments
            WHERE doctor_id = ? AND DATE(appointment_date) = ?
            GROUP BY status
        `;

        const [report] = await db.execute(sql, [doctor_id, date]);
        const statusSummary = {
            [ACTIVE_STATUS]: 0,
            [COMPLETED_STATUS]: 0,
            [CANCELLED_STATUS]: 0
        };

        let totalAppointments = 0;
        report.forEach((row) => {
            statusSummary[row.status] = row.count;
            totalAppointments += row.count;
        });

        res.status(200).json({
            message: 'Daily report loaded successfully.',
            report_date: date,
            doctor_id,
            total_appointments: totalAppointments,
            details: statusSummary
        });
    } catch (error) {
        console.error('Error in getDailyReport:', error);
        res.status(500).json({ error: 'Failed to load daily report.' });
    }
};

const validateBookingDateTime = (appointmentDate, appointmentTime) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(appointmentDate);
    selectedDate.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7);

    if (Number.isNaN(selectedDate.getTime())) {
        return 'Invalid appointment date.';
    }

    if (selectedDate < today) {
        return 'Cannot book an appointment in the past.';
    }

    if (selectedDate > maxDate) {
        return 'Appointments can be booked up to 7 days in advance only.';
    }

    const selectedDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (selectedDateTime <= new Date()) {
        return 'Cannot book a time that has already passed.';
    }

    return '';
};

const rescheduleAppointment = async (req, res) => {
    try {
        const { appointment_id } = req.params;
        const { new_date, new_time } = req.body;

        if (!new_date || !new_time) {
            return res.status(400).json({ error: 'Please select a new date and time.' });
        }

        const normalizedTime = String(new_time).length === 5 ? `${new_time}:00` : new_time;
        const validationError = validateBookingDateTime(new_date, normalizedTime);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        
        const checkSql = `
            SELECT status, patient_id, doctor_id,
                   TIMESTAMPDIFF(MINUTE, NOW(), TIMESTAMP(appointment_date, appointment_time)) AS minutes_left
            FROM Appointments
            WHERE appointment_id = ?
        `;
        const [appointments] = await db.execute(checkSql, [appointment_id]);

        if (appointments.length === 0) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        const appointment = appointments[0];

        if (req.user.role === 'patient' && appointment.patient_id !== req.user.id) {
            return res.status(403).json({ error: 'คุณไม่มีสิทธิ์เลื่อนคิวของผู้อื่น!' });
        }
        
        if (req.user.role === 'doctor' && appointment.doctor_id !== req.user.id) {
            return res.status(403).json({ error: 'คุณไม่มีสิทธิ์จัดการคิวของแพทย์ท่านอื่น!' });
        }

        if (appointment.status !== ACTIVE_STATUS) {
            return res.status(400).json({ error: 'This appointment cannot be rescheduled.' });
        }

        if (appointment.minutes_left < 60) {
            return res.status(400).json({ error: 'Appointments must be rescheduled at least 1 hour before the scheduled time.' });
        }

        const [sameSlotRows] = await db.execute(
            `SELECT appointment_id FROM Appointments
             WHERE doctor_id = ?
               AND appointment_date = ?
               AND appointment_time = ?
               AND status = ?
               AND appointment_id <> ?`,
            [appointment.doctor_id, new_date, normalizedTime, ACTIVE_STATUS, appointment_id]
        );

        if (sameSlotRows.length > 0) {
            return res.status(400).json({ error: 'This time slot is already booked. Please choose another time.' });
        }

        const [scheduleRows] = await db.execute(
            `SELECT max_queue FROM Schedules
             WHERE doctor_id = ? AND available_date = ? AND available_time = ?
             LIMIT 1`,
            [appointment.doctor_id, new_date, normalizedTime]
        );
        const maxQueue = scheduleRows[0]?.max_queue || 3;

        const [doctorDailyQueues] = await db.execute(
            `SELECT COUNT(*) AS total FROM Appointments
             WHERE doctor_id = ?
               AND appointment_date = ?
               AND status = ?
               AND appointment_id <> ?`,
            [appointment.doctor_id, new_date, ACTIVE_STATUS, appointment_id]
        );

        if ((doctorDailyQueues[0]?.total || 0) >= maxQueue) {
            return res.status(400).json({ error: `This doctor is fully booked for the selected date. Maximum queue is ${maxQueue}.` });
        }

        await db.execute(
            'UPDATE Appointments SET appointment_date = ?, appointment_time = ? WHERE appointment_id = ?',
            [new_date, normalizedTime, appointment_id]
        );

        res.status(200).json({
            message: 'Appointment rescheduled successfully.',
            new_schedule: { date: new_date, time: normalizedTime }
        });
    } catch (error) {
        console.error('Error in rescheduleAppointment:', error);
        res.status(500).json({ error: 'Failed to reschedule appointment.' });
    }
};

const getDoctorAlert = async (req, res) => {
    try {
        const { doctor_id } = req.params;

        if (req.user?.role !== 'doctor' || req.user?.id !== doctor_id) {
            return res.status(403).json({ error: 'You can only view alerts for your doctor account.' });
        }

        const [notificationRows] = await db.execute(
            `SELECT n.notification_id, n.message, n.status, n.created_at,
                    a.appointment_id, p.name AS patient_name,
                    DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
                    a.appointment_time
             FROM Notifications n
             JOIN Appointments a ON n.appointment_id = a.appointment_id
             JOIN Patients p ON a.patient_id = p.patient_id
             WHERE n.doctor_id = ?
               AND n.status = 'unread'
               AND DATE(a.appointment_date) = CURDATE()
               AND a.status = ?
             ORDER BY n.created_at DESC`,
            [doctor_id, ACTIVE_STATUS]
        );

        const [todayConfirmedRows] = await db.execute(
            `SELECT COUNT(*) AS new_queues
             FROM Appointments
             WHERE doctor_id = ?
               AND status = ?
               AND DATE(appointment_date) = CURDATE()`,
            [doctor_id, ACTIVE_STATUS]
        );

        res.status(200).json({
            message: 'Doctor alert loaded successfully.',
            today_date: new Date().toISOString().split('T')[0],
            new_queues: todayConfirmedRows[0]?.new_queues || 0,
            unread_notifications: notificationRows
        });
    } catch (error) {
        console.error('Error in getDoctorAlert:', error);
        res.status(500).json({ error: 'Failed to load doctor alert.' });
    }
};

const getQueueStatus = async (req, res) => {
    try {
        const { appointment_id } = req.params;

        const [myQueue] = await db.execute(
            `SELECT appointment_id, patient_id, doctor_id, DATE_FORMAT(appointment_date, '%Y-%m-%d') AS appointment_date, appointment_time, status
             FROM Appointments WHERE appointment_id = ?`,
            [appointment_id]
        );

        if (myQueue.length === 0) {
            return res.status(404).json({ error: 'Queue not found.' });
        }

        const queue = myQueue[0];

        if (req.user?.role === 'patient' && queue.patient_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only view your own queue status.' });
        }

        if (req.user?.role === 'doctor' && queue.doctor_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only view queues assigned to your doctor account.' });
        }

        const [queueRows] = await db.execute(
            `SELECT appointment_id, status
             FROM Appointments
             WHERE doctor_id = ?
               AND appointment_date = ?
               AND status <> ?
             ORDER BY appointment_time ASC, appointment_id ASC`,
            [queue.doctor_id, queue.appointment_date, CANCELLED_STATUS]
        );

        const myIndex = queueRows.findIndex((item) => item.appointment_id === appointment_id);
        const servingIndex = queueRows.findIndex((item) => item.status === ACTIVE_STATUS);
        const queuesAhead = queue.status === ACTIVE_STATUS && myIndex > -1
            ? queueRows.slice(0, myIndex).filter((item) => item.status === ACTIVE_STATUS).length
            : 0;
        const estimatedWaitTime = queuesAhead * 15;
        const completedQueues = queueRows.filter((item) => item.status === COMPLETED_STATUS).length;

        res.status(200).json({
            my_queue: myIndex > -1 ? formatQueueNo(myIndex) : '-',
            calling_queue: servingIndex > -1 ? formatQueueNo(servingIndex) : '-',
            raw_appointment_id: appointment_id,
            queue_position: myIndex > -1 ? myIndex + 1 : 0,
            queues_ahead: queuesAhead,
            estimated_wait_time: estimatedWaitTime,
            total_queues: queueRows.length,
            completed_queues: completedQueues,
            status: queue.status
        });

    } catch (error) {
        console.error('Error in getQueueStatus:', error);
        res.status(500).json({ error: 'Failed to load queue status.' });
    }
};

module.exports = {
    bookAppointment,
    getPatientAppointments,
    cancelAppointment,
    getDoctorAppointments,
    completeAppointment,
    getDailyReport,
    rescheduleAppointment,
    getDoctorAlert,
    getQueueStatus
};