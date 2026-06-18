const db = require('../config/db');

const getAdminSummary = async (req, res) => {
    try {
        const [[doctorCount]] = await db.execute('SELECT COUNT(*) AS total FROM Doctors');
        const [[patientCount]] = await db.execute('SELECT COUNT(*) AS total FROM Patients');
        const [[appointmentCount]] = await db.execute('SELECT COUNT(*) AS total FROM Appointments');
        const [statusRows] = await db.execute(`
            SELECT status, COUNT(*) AS total
            FROM Appointments
            GROUP BY status
        `);
        const [doctors] = await db.execute('SELECT doctor_id, name, department, email FROM Doctors ORDER BY doctor_id');
        const [recentAppointments] = await db.execute(`
            SELECT a.appointment_id,
                   DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointment_date,
                   a.appointment_time,
                   a.status,
                   p.name AS patient_name,
                   d.name AS doctor_name,
                   d.department
            FROM Appointments a
            JOIN Patients p ON a.patient_id = p.patient_id
            JOIN Doctors d ON a.doctor_id = d.doctor_id
            ORDER BY a.created_at DESC
            LIMIT 8
        `);

        res.status(200).json({
            totals: {
                doctors: doctorCount.total,
                patients: patientCount.total,
                appointments: appointmentCount.total
            },
            statusSummary: statusRows,
            doctors,
            recentAppointments
        });
    } catch (error) {
        console.error('Error in getAdminSummary:', error);
        res.status(500).json({ error: 'Failed to load admin summary.' });
    }
};

module.exports = { getAdminSummary };
