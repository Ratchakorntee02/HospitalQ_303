import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, getAuthSession } from '../services/api.js';

const today = () => new Date().toISOString().slice(0, 10);

const dashboardText = {
  en: {
    title: 'Doctor Dashboard',
    subtitle: 'View appointments, reschedule queues, update status, and review daily alerts.',
    loginRequired: 'Please login with a doctor account.',
    total: 'Total Appointments',
    waiting: 'Waiting',
    completed: 'Completed',
    todayAlert: 'Today Alert',
    reportDate: 'Daily Report Date',
    patient: 'Patient',
    dateTime: 'Date & Time',
    symptoms: 'Current Symptoms',
    status: 'Status',
    action: 'Action',
    complete: 'Mark Completed',
    reschedule: 'Reschedule',
    save: 'Save',
    cancel: 'Cancel',
    empty: 'No appointments found for this doctor.',
    completedMessage: 'Appointment status updated to completed.',
    rescheduledMessage: 'Appointment rescheduled successfully.',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completedStatus: 'Completed',
    queuesToday: 'confirmed queue(s) today',
  },
  th: {
    title: 'Doctor Dashboard',
    subtitle: 'ดูรายการนัด เลื่อนคิว อัปเดตสถานะ และตรวจรายงานประจำวันของแพทย์',
    loginRequired: 'กรุณาเข้าสู่ระบบด้วยบัญชีแพทย์',
    total: 'นัดหมายทั้งหมด',
    waiting: 'รอตรวจ',
    completed: 'ตรวจเสร็จแล้ว',
    todayAlert: 'แจ้งเตือนวันนี้',
    reportDate: 'วันที่รายงานประจำวัน',
    patient: 'ผู้ป่วย',
    dateTime: 'วันและเวลา',
    symptoms: 'Current Symptoms',
    status: 'สถานะ',
    action: 'จัดการ',
    complete: 'ตรวจเสร็จ',
    reschedule: 'เลื่อนคิว',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    empty: 'ไม่พบรายการนัดของแพทย์คนนี้',
    completedMessage: 'อัปเดตสถานะเป็นตรวจเสร็จแล้ว',
    rescheduledMessage: 'เลื่อนคิวสำเร็จแล้ว',
    confirmed: 'ยืนยันแล้ว',
    cancelled: 'ยกเลิกแล้ว',
    completedStatus: 'ตรวจเสร็จแล้ว',
    queuesToday: 'คิวที่ยืนยันแล้วในวันนี้',
  },
};

const statusClass = {
  confirmed: 'text-bg-warning',
  completed: 'text-bg-success',
  cancelled: 'text-bg-secondary',
};

function DoctorDashboard({ language = 'en' }) {
  const [appointments, setAppointments] = useState([]);
  const [dailyReport, setDailyReport] = useState(null);
  const [doctorAlert, setDoctorAlert] = useState(null);
  const [reportDate, setReportDate] = useState(today());
  const [editingId, setEditingId] = useState('');
  const [rescheduleForm, setRescheduleForm] = useState({ new_date: '', new_time: '' });
  const [message, setMessage] = useState('');
  const text = dashboardText[language];
  const authSession = getAuthSession();
  const isDoctor = authSession?.role === 'doctor';
  const doctorId = authSession?.user?.id;

  const loadDoctorData = useCallback(async () => {
    if (!doctorId || !isDoctor) {
      return;
    }

    try {
      const [appointmentData, reportData, alertData] = await Promise.all([
        api.getDoctorAppointments(doctorId),
        api.getDoctorDailyReport(doctorId, reportDate),
        api.getDoctorAlert(doctorId),
      ]);

      setAppointments(appointmentData);
      setDailyReport(reportData);
      setDoctorAlert(alertData);
    } catch (apiError) {
      setMessage(apiError.message);
    }
  }, [doctorId, isDoctor, reportDate]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadDoctorData();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadDoctorData]);

  const summary = useMemo(() => {
    const completed = appointments.filter((appointment) => appointment.status === 'completed').length;
    const cancelled = appointments.filter((appointment) => appointment.status === 'cancelled').length;

    return {
      total: appointments.length,
      completed,
      waiting: appointments.length - completed - cancelled,
    };
  }, [appointments]);

  const formatStatus = (status) => {
    if (status === 'confirmed') {
      return text.confirmed;
    }

    if (status === 'completed') {
      return text.completedStatus;
    }

    if (status === 'cancelled') {
      return text.cancelled;
    }

    return status;
  };

  const openReschedule = (appointment) => {
    setEditingId(appointment.appointment_id);
    setRescheduleForm({
      new_date: appointment.appointment_date,
      new_time: appointment.appointment_time?.slice(0, 5) || '',
    });
  };

  const handleComplete = async (appointmentId) => {
    try {
      await api.completeAppointment(appointmentId);
      setMessage(text.completedMessage);
      await loadDoctorData();
    } catch (apiError) {
      setMessage(apiError.message);
    }
  };

  const handleReschedule = async (appointmentId) => {
    try {
      await api.rescheduleAppointment(appointmentId, rescheduleForm);
      setEditingId('');
      setMessage(text.rescheduledMessage);
      await loadDoctorData();
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
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 dashboard-stat-card">
            <span>{text.total}</span>
            <strong>{summary.total}</strong>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 dashboard-stat-card">
            <span>{text.waiting}</span>
            <strong>{summary.waiting}</strong>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 dashboard-stat-card">
            <span>{text.completed}</span>
            <strong>{summary.completed}</strong>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm p-3 dashboard-stat-card">
            <span>{text.todayAlert}</span>
            <strong>{doctorAlert?.new_queues ?? 0}</strong>
            <small className="text-muted">{text.queuesToday}</small>
          </div>
        </div>
      </section>

      <section className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label fw-semibold" htmlFor="doctor-report-date">
              {text.reportDate}
            </label>
            <input
              className="form-control"
              id="doctor-report-date"
              type="date"
              value={reportDate}
              onChange={(event) => setReportDate(event.target.value)}
            />
          </div>
          <div className="col-md-8">
            <div className="d-flex flex-wrap gap-2">
              <span className="badge text-bg-primary px-3 py-2">
                {text.total}: {dailyReport?.total_appointments ?? 0}
              </span>
              <span className="badge text-bg-warning px-3 py-2">
                {text.confirmed}: {dailyReport?.details?.confirmed ?? 0}
              </span>
              <span className="badge text-bg-success px-3 py-2">
                {text.completedStatus}: {dailyReport?.details?.completed ?? 0}
              </span>
              <span className="badge text-bg-secondary px-3 py-2">
                {text.cancelled}: {dailyReport?.details?.cancelled ?? 0}
              </span>
            </div>
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
                  <td>
                    {editingId === appointment.appointment_id ? (
                      <div className="d-flex flex-column gap-2">
                        <input
                          className="form-control form-control-sm"
                          type="date"
                          value={rescheduleForm.new_date}
                          onChange={(event) => setRescheduleForm({ ...rescheduleForm, new_date: event.target.value })}
                        />
                        <input
                          className="form-control form-control-sm"
                          type="time"
                          value={rescheduleForm.new_time}
                          onChange={(event) => setRescheduleForm({ ...rescheduleForm, new_time: event.target.value })}
                        />
                      </div>
                    ) : (
                      `${appointment.appointment_date} ${appointment.appointment_time}`
                    )}
                  </td>
                  <td>{appointment.current_symptoms || '-'}</td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-2 ${statusClass[appointment.status] || 'text-bg-light'}`}>
                      {formatStatus(appointment.status)}
                    </span>
                  </td>
                  <td className="text-center">
                    {appointment.status === 'confirmed' && editingId === appointment.appointment_id ? (
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm btn-primary"
                          type="button"
                          onClick={() => handleReschedule(appointment.appointment_id)}
                        >
                          {text.save}
                        </button>
                        <button
                          className="btn btn-sm btn-light border"
                          type="button"
                          onClick={() => setEditingId('')}
                        >
                          {text.cancel}
                        </button>
                      </div>
                    ) : appointment.status === 'confirmed' ? (
                      <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          type="button"
                          onClick={() => openReschedule(appointment)}
                        >
                          {text.reschedule}
                        </button>
                        <button
                          className="btn btn-sm btn-success"
                          type="button"
                          onClick={() => handleComplete(appointment.appointment_id)}
                        >
                          {text.complete}
                        </button>
                      </div>
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
