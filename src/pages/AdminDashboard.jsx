import { useEffect, useState } from 'react';
import { api, getAuthSession } from '../services/api.js';

const adminText = {
  en: {
    title: 'Admin Dashboard',
    subtitle: 'Quick hospital queue overview for demo and operational monitoring.',
    loginRequired: 'Please login with an admin account.',
    doctors: 'Doctors',
    patients: 'Patients',
    appointments: 'Appointments',
    doctorList: 'Doctor List',
    recent: 'Recent Appointments',
    department: 'Department',
    email: 'Email',
    patient: 'Patient',
    doctor: 'Doctor',
    dateTime: 'Date & Time',
    status: 'Status',
  },
  th: {
    title: 'Admin Dashboard',
    subtitle: 'ภาพรวมระบบคิวโรงพยาบาลสำหรับ demo และติดตามการใช้งาน',
    loginRequired: 'กรุณาเข้าสู่ระบบด้วยบัญชีแอดมิน',
    doctors: 'แพทย์',
    patients: 'ผู้ป่วย',
    appointments: 'นัดหมาย',
    doctorList: 'รายชื่อแพทย์',
    recent: 'นัดหมายล่าสุด',
    department: 'แผนก',
    email: 'อีเมล',
    patient: 'ผู้ป่วย',
    doctor: 'แพทย์',
    dateTime: 'วันและเวลา',
    status: 'สถานะ',
  },
};

function AdminDashboard({ language = 'en' }) {
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState('');
  const text = adminText[language];
  const authSession = getAuthSession();
  const isAdmin = authSession?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    api.getAdminSummary()
      .then(setSummary)
      .catch((apiError) => setMessage(apiError.message));
  }, [isAdmin]);

  if (!isAdmin) {
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
            <span>{text.doctors}</span>
            <strong>{summary?.totals?.doctors ?? '-'}</strong>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 admin-stat-card">
            <span>{text.patients}</span>
            <strong>{summary?.totals?.patients ?? '-'}</strong>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 admin-stat-card">
            <span>{text.appointments}</span>
            <strong>{summary?.totals?.appointments ?? '-'}</strong>
          </div>
        </div>
      </section>

      <section className="row g-4">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <h4 className="fw-bold text-dark-blue mb-3">{text.doctorList}</h4>
            <div className="list-group list-group-flush">
              {summary?.doctors?.map((doctor) => (
                <div className="list-group-item px-0" key={doctor.doctor_id}>
                  <strong>{doctor.name}</strong>
                  <div className="text-muted small">{text.department}: {doctor.department}</div>
                  <div className="text-muted small">{text.email}: {doctor.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <h4 className="fw-bold text-dark-blue mb-3">{text.recent}</h4>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>{text.patient}</th>
                    <th>{text.doctor}</th>
                    <th>{text.dateTime}</th>
                    <th>{text.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {summary?.recentAppointments?.map((appointment) => (
                    <tr key={appointment.appointment_id}>
                      <td>{appointment.patient_name}</td>
                      <td>{appointment.doctor_name}</td>
                      <td>{appointment.appointment_date} {appointment.appointment_time}</td>
                      <td><span className="badge text-bg-primary rounded-pill">{appointment.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {message && <div className="alert alert-info border-0 mt-4">{message}</div>}
    </main>
  );
}

export default AdminDashboard;
