import { useEffect, useMemo, useState } from 'react';
import { api, getAuthSession } from '../services/api.js';

const queueStatusText = {
  en: {
    live: 'Live Queue',
    yourNumber: 'Your Queue Number',
    nowServing: 'Now Serving',
    ahead: 'Queues Ahead',
    queues: 'Queues',
    estimate: 'Estimated wait:',
    updated: 'Updated from your real appointment data',
    progress: 'Queue progress:',
    completed: 'completed',
    notify: 'Notify Me When Close',
    enabled: 'Notification Enabled',
    navigate: 'Navigate to Department',
    department: 'Department',
    doctor: 'Doctor',
    room: 'Examination Room',
    location: 'Hospital Queue Area',
    waitMinute: (minutes) => `${minutes} minutes`,
    loginRequired: 'Please login as a patient to view your queue status.',
    empty: 'You do not have a confirmed appointment yet.',
    loading: 'Loading queue status...',
  },
  th: {
    live: 'คิวเรียลไทม์',
    yourNumber: 'หมายเลขคิวของคุณ',
    nowServing: 'คิวที่กำลังเรียก',
    ahead: 'จำนวนคิวที่ต้องรอ',
    queues: 'คิว',
    estimate: 'เวลารอโดยประมาณ:',
    updated: 'อัปเดตจากข้อมูลนัดหมายจริงของคุณ',
    progress: 'ความคืบหน้าคิว:',
    completed: 'เสร็จสิ้น',
    notify: 'แจ้งเตือนเมื่อใกล้ถึงคิว',
    enabled: 'เปิดการแจ้งเตือนแล้ว',
    navigate: 'นำทางไปยังแผนก',
    department: 'แผนก',
    doctor: 'แพทย์',
    room: 'ห้องตรวจ',
    location: 'พื้นที่รอคิวโรงพยาบาล',
    waitMinute: (minutes) => `${minutes} นาที`,
    loginRequired: 'กรุณาเข้าสู่ระบบผู้ป่วยเพื่อดูสถานะคิวของคุณ',
    empty: 'คุณยังไม่มีรายการนัดหมายที่ยืนยันแล้ว',
    loading: 'กำลังโหลดสถานะคิว...',
  },
};

const getAppointmentDateTime = (appointment) => {
  if (!appointment) return new Date(0);
  return new Date(`${appointment.appointment_date}T${appointment.appointment_time || '00:00:00'}`);
};

function QueueStatus({ language = 'en' }) {
  const [isNotifyEnabled, setIsNotifyEnabled] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const text = queueStatusText[language];
  const authSession = getAuthSession();
  const isPatient = authSession?.role === 'patient';
  const authToken = authSession?.token;
  const patientId = authSession?.user?.id;

  useEffect(() => {
    const loadQueueStatus = async () => {
      if (!authToken || !isPatient || !patientId) {
        setAppointment(null);
        setQueueStatus(null);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const appointments = await api.getPatientAppointments(patientId);
        const now = new Date();
        const nextConfirmed = (Array.isArray(appointments) ? appointments : [])
          .filter((item) => item.status === 'confirmed')
          .map((item) => ({ ...item, appointmentDateTime: getAppointmentDateTime(item) }))
          .filter((item) => item.appointmentDateTime >= now)
          .sort((a, b) => a.appointmentDateTime - b.appointmentDateTime)[0] || null;

        setAppointment(nextConfirmed);

        if (nextConfirmed?.appointment_id) {
          const statusResult = await api.getQueueStatus(nextConfirmed.appointment_id);
          setQueueStatus(statusResult);
        } else {
          setQueueStatus(null);
        }
      } catch (apiError) {
        setError(apiError.message);
        setAppointment(null);
        setQueueStatus(null);
      } finally {
        setLoading(false);
      }
    };

    loadQueueStatus();
  }, [authToken, isPatient, patientId]);

  const queueBars = useMemo(() => {
    const totalQueues = Math.max(1, Number(queueStatus?.total_queues || 1));
    const visibleSteps = Math.min(5, totalQueues);
    const completedQueues = Number(queueStatus?.completed_queues || 0);
    const hasCallingQueue = queueStatus?.calling_queue && queueStatus.calling_queue !== '-';
    const activeFromProgress = Math.min(totalQueues, completedQueues + (hasCallingQueue ? 1 : 0));
    const activeSteps = Math.max(1, Math.ceil((activeFromProgress / totalQueues) * visibleSteps));

    return Array.from({ length: visibleSteps }, (_, index) => ({
      index,
      active: index < activeSteps,
    }));
  }, [queueStatus]);

  if (!authSession?.token || !isPatient) {
    return (
      <main className="container py-5 queue-status-page">
        <div className="alert alert-warning border-0 shadow-sm">{text.loginRequired}</div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="container py-5 queue-status-page">
        <div className="alert alert-info border-0 shadow-sm">{text.loading}</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-5 queue-status-page">
        <div className="alert alert-danger border-0 shadow-sm">{error}</div>
      </main>
    );
  }

  if (!appointment || !queueStatus) {
    return (
      <main className="container py-5 queue-status-page">
        <div className="alert alert-info border-0 shadow-sm">{text.empty}</div>
      </main>
    );
  }

  return (
    <main className="container py-5 queue-status-page">
      <section className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4 text-center">
        <div className="card-body">
          <span className="queue-live-badge mb-3">{text.live}</span>
          <p className="text-muted fw-medium fs-4 mb-1">{text.yourNumber}</p>

          <h1 className="queue-number my-3">{queueStatus.my_queue}</h1>

          <h2 className="fw-bold text-dark-blue mb-2">{appointment.department || text.department}</h2>
          <p className="text-muted fs-5 mb-1">{text.doctor}: {appointment.doctor_name || '-'}</p>
          <p className="text-muted fs-5 mb-0">{text.location}</p>

          <hr className="my-4 mx-auto queue-divider" />

          <div className="row g-3 my-2">
            <div className="col-md-6 queue-summary-divider">
              <p className="text-muted text-uppercase fw-bold mb-2">{text.nowServing}</p>
              <h2 className="fw-bold text-dark queue-now-serving">{queueStatus.calling_queue || '-'}</h2>
            </div>
            <div className="col-md-6">
              <p className="text-muted text-uppercase fw-bold mb-2">{text.ahead}</p>
              <h2 className="fw-bold text-danger queue-waiting-count">
                {queueStatus.queues_ahead ?? 0} {text.queues}
              </h2>
            </div>
          </div>

          <div className="queue-status-bars mt-4" aria-label="Queue progress">
            {queueBars.map((bar) => (
              <div
                className={`queue-status-bar ${bar.active ? 'active' : ''}`}
                key={bar.index}
              ></div>
            ))}
          </div>

          <p className="text-muted small mt-3 mb-1">
            {text.progress} {queueStatus.completed_queues || 0}/{queueStatus.total_queues || 1} {text.completed}
          </p>
          <p className="queue-estimate mt-2 mb-1">
            {text.estimate} {text.waitMinute(queueStatus.estimated_wait_time ?? 0)}
          </p>
          <p className="text-muted mb-0">{text.updated}</p>
        </div>
      </section>

      <section className="queue-action-panel">
        <button
          className={`btn px-4 py-3 queue-action-btn ${
            isNotifyEnabled ? 'btn-success' : 'btn-outline-primary'
          }`}
          type="button"
          onClick={() => setIsNotifyEnabled((current) => !current)}
        >
          {isNotifyEnabled ? text.enabled : text.notify}
        </button>

        <button className="btn btn-outline-secondary px-4 py-3 queue-action-btn" type="button">
          {text.navigate}
        </button>
      </section>
    </main>
  );
}

export default QueueStatus;
