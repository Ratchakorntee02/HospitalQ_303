const db = require('../config/db');

const ACTIVE_STATUS = 'confirmed';
const COMPLETED_STATUS = 'completed';
const CANCELLED_STATUS = 'cancelled';

const bookAppointment = async (req, res) => {
    try {
        const {
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            current_symptoms
        } = req.body;

        const [existing] = await db.execute(
            'SELECT * FROM Appointments WHERE patient_id = ? AND status = ?',
            [patient_id, ACTIVE_STATUS]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                error: 'You already have an active appointment in the system.'
            });
        }

        const appointment_id = 'A' + Date.now();
        const sql = `
            INSERT INTO Appointments (
                appointment_id, patient_id, doctor_id, appointment_date,
                appointment_time, current_symptoms, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.execute(sql, [
            appointment_id,
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            current_symptoms || null,
            ACTIVE_STATUS
        ]);

        res.status(201).json({
            message: 'Appointment booked successfully.',
            appointment_id
        });
    } catch (error) {
        console.error('Error in bookAppointment:', error);
        res.status(500).json({ error: 'Failed to book appointment.' });
    }
};

const getPatientAppointments = async (req, res) => {
    try {
        const { patient_id } = req.params;
        const sql = `
            SELECT a.appointment_id,
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
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error in getPatientAppointments:', error);
        res.status(500).json({ error: 'Failed to load appointment history.' });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { appointment_id } = req.params;
        const checkSql = `
            SELECT status,
                   TIMESTAMPDIFF(MINUTE, NOW(), TIMESTAMP(appointment_date, appointment_time)) AS minutes_left
            FROM Appointments
            WHERE appointment_id = ?
        `;
        const [appointments] = await db.execute(checkSql, [appointment_id]);

        if (appointments.length === 0) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        const appointment = appointments[0];

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
        const sql = `
            SELECT a.appointment_id,
                   DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
                   a.appointment_time,
                   a.current_symptoms,
                   a.status,
                   p.name AS patient_name,
                   p.phone,
                   TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) AS patient_age
            FROM Appointments a
            JOIN Patients p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = ?
            ORDER BY a.appointment_date ASC, a.appointment_time ASC
        `;

        const [appointments] = await db.execute(sql, [doctor_id]);
        res.status(200).json(appointments);
    } catch (error) {
        console.error('Error in getDoctorAppointments:', error);
        res.status(500).json({ error: 'Failed to load doctor appointments.' });
    }
};

const completeAppointment = async (req, res) => {
    try {
        const { appointment_id } = req.params;
        const [appointments] = await db.execute(
            'SELECT status FROM Appointments WHERE appointment_id = ?',
            [appointment_id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ error: 'Appointment not found.' });
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

const rescheduleAppointment = async (req, res) => {
    try {
        const { appointment_id } = req.params;
        const { new_date, new_time } = req.body;
        const checkSql = `
            SELECT status,
                   TIMESTAMPDIFF(MINUTE, NOW(), TIMESTAMP(appointment_date, appointment_time)) AS minutes_left
            FROM Appointments
            WHERE appointment_id = ?
        `;
        const [appointments] = await db.execute(checkSql, [appointment_id]);

        if (appointments.length === 0) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        const appointment = appointments[0];

        if (appointment.status !== ACTIVE_STATUS) {
            return res.status(400).json({
                error: 'This appointment cannot be rescheduled.'
            });
        }

        if (appointment.minutes_left < 60) {
            return res.status(400).json({
                error: 'Appointments must be rescheduled at least 1 hour before the scheduled time.'
            });
        }

        await db.execute(
            'UPDATE Appointments SET appointment_date = ?, appointment_time = ? WHERE appointment_id = ?',
            [new_date, new_time, appointment_id]
        );

        res.status(200).json({
            message: 'Appointment rescheduled successfully.',
            new_schedule: {
                date: new_date,
                time: new_time
            }
        });
    } catch (error) {
        console.error('Error in rescheduleAppointment:', error);
        res.status(500).json({ error: 'Failed to reschedule appointment.' });
    }
};

const getDoctorAlert = async (req, res) => {
    try {
        const { doctor_id } = req.params;
        const sql = `
            SELECT COUNT(*) AS new_queues
            FROM Appointments
            WHERE doctor_id = ?
              AND status = ?
              AND DATE(appointment_date) = CURDATE()
        `;

        const [result] = await db.execute(sql, [doctor_id, ACTIVE_STATUS]);

        res.status(200).json({
            message: 'Doctor alert loaded successfully.',
            today_date: new Date().toISOString().split('T')[0],
            new_queues: result[0].new_queues
        });
    } catch (error) {
        console.error('Error in getDoctorAlert:', error);
        res.status(500).json({ error: 'Failed to load doctor alert.' });
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
    getDoctorAlert
};
