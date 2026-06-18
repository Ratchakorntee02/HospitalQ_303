import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, getAuthSession } from '../services/api.js';

const dashboardText = {
  en: {
    title: 'Doctor Dashboard',
    subtitle: 'Review today queue list and mark appointments as completed.',
    loginRequired: 'Please login with a doctor account.',
    total: 'Total Queue',
    waiting: 'Waiting',
    completed: 'Completed',
    patient: 'Patient',
    dateTime: 'Date & Time',
    symptoms: 'Current Symptoms',
    status: 'Status',
    action: 'Action',
    complete: 'Complete',
    empty: 'No appointments found for this doctor.',
  },
  th: {
    title: 'Doctor Dashboard',
    subtitle: 'ดูรายการคิวของแพทย์และกดจบรายการตรวจ',
    loginRequired: 'กรุณาเข้าสู่ระบบด้วยบัญชีแพทย์',
    total: 'คิวทั้งหมด',
    waiting: 'รอตรวจ',
    completed: 'เสร็จสิ้น',
    patient: 'ผู้ป่วย',
    dateTime: 'วันและเวลา',
    symptoms: 'Current Symptoms',
    status: 'สถานะ',
    action: 'จัดการ',
    complete: 'ตรวจเสร็จ',
    empty: 'ไม่พบรายการนัดของแพทย์คนนี้',
  },
};

function DoctorDashboard({ language = 'en' }) {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const text = dashboardText[language];
  const authSession = getAuthSession();
  const isDoctor = authSession?.role === 'doctor';

  const loadAppointments = useCallback(() => {
    if (!authSession?.user?.id || !isDoctor) {
      return;
    }

    api.getDoctorAppointments(authSession.user.id)
      .then(setAppointments)
      .catch((apiError) => setMessage(apiError.message));
  }, [authSession?.user?.id, isDoctor]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const summary = useMemo(() => {
    const completed = appointments.filter((appointment) => appointment.status === 'completed').length;

    return {
      total: appointments.length,
      completed,
      waiting: appointments.length - completed,
    };
  }, [appointments]);

  const handleComplete = async (appointmentId) => {
    try {
      await api.completeAppointment(appointmentId);
      setMessage('Appointment completed.');
      loadAppointments();
    } catch (apiError) {
      setMessage(apiError.message);
    }
  };

  if (!isDoctor) {
    return (
      <main className="container py-5">
        <div className="alert alert-warning border-0 shadow-sm">{text.loginRequired}</div>
      </main>
    );
  }

  return (
    <main className="container py-5">
      <section className="mb-4">
        <h2 className="fw-bold text-dark-blue mb-2">{text.title}</h2>
        <p className="text-muted mb-0">{text.subtitle}</p>
      </section>

      <section className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 admin-stat-card">
            <span>{text.total}</span>
            <strong>{summary.total}</strong>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 admin-stat-card">
            <span>{text.waiting}</span>
            <strong>{summary.waiting}</strong>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 admin-stat-card">
            <span>{text.completed}</span>
            <strong>{summary.completed}</strong>
          </div>
        </div>
      </section>

      <section className="card border-0 shadow-sm rounded-3 p-4 bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>{text.patient}</th>
                <th>{text.dateTime}</th>
                <th>{text.symptoms}</th>
                <th>{text.status}</th>
                <th className="text-center">{text.action}</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.appointment_id}>
                  <td>
                    <strong>{appointment.patient_name}</strong>
                    <div className="text-muted small">{appointment.phone}</div>
                  </td>
                  <td>{appointment.appointment_date} {appointment.appointment_time}</td>
                  <td>{appointment.current_symptoms || '-'}</td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-2 ${
                      appointment.status === 'completed' ? 'text-bg-success' : 'text-bg-warning'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="text-center">
                    {appointment.status !== 'completed' ? (
                      <button
                        className="btn btn-sm btn-success"
                        type="button"
                        onClick={() => handleComplete(appointment.appointment_id)}
                      >
                        {text.complete}
                      </button>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {appointments.length === 0 && <p className="text-muted text-center py-4 mb-0">{text.empty}</p>}
        {message && <div className="alert alert-info border-0 mb-0 mt-3">{message}</div>}
      </section>
    </main>
  );
}

export default DoctorDashboard;
