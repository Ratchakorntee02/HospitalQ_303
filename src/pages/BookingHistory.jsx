import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, getAuthSession } from '../services/api.js';

const fallbackBookings = [
  {
    id: 'apt-001',
    date: 'May 22, 2026',
    time: '10:30:00',
    department: 'General Medicine',
    doctor: 'Dr. Stone',
    status: 'confirmed',
  },
  {
    id: 'apt-002',
    date: 'June 3, 2026',
    time: '13:30:00',
    department: 'Dental Clinic',
    doctor: 'Dr. Strang',
    status: 'confirmed',
  },
  {
    id: 'apt-003',
    date: 'April 18, 2026',
    time: '09:00:00',
    department: 'General Medicine',
    doctor: 'Dr. Ratchakorn',
    status: 'completed',
  },
  {
    id: 'apt-004',
    date: 'March 12, 2026',
    time: '14:00:00',
    department: 'Pediatrics',
    doctor: 'Dr. Nopparat',
    status: 'completed',
  },
];

const tabs = ['all', 'upcoming', 'completed'];

const getMinutesUntilAppointment = (booking) => {
  const appointmentDateTime = new Date(`${booking.date}T${booking.time}`);

  if (Number.isNaN(appointmentDateTime.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return (appointmentDateTime.getTime() - Date.now()) / 60000;
};

const historyText = {
  en: {
    title: 'Booking History',
    subtitle: 'Review upcoming appointments and completed visits in one clean table.',
    all: 'All',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
    dateTime: 'Date & Time',
    department: 'Department',
    doctor: 'Doctor',
    status: 'Status',
    actions: 'Actions',
    reschedule: 'Reschedule',
    cancel: 'Cancel',
    empty: 'No booking records found for this filter.',
    cancelSuccess: 'Appointment cancelled successfully.',
    cancelConfirm: 'Are you sure you want to cancel this appointment?',
    cancelTooLate: 'Appointments can only be cancelled at least 1 hour before the scheduled time.',
    reschedulePrompt: 'Enter a new appointment date in YYYY-MM-DD format.',
    rescheduleSuccess: 'Appointment rescheduled successfully.',
    loginNotice: 'Login to load your real appointment history from the backend.',
  },
  th: {
    title: 'ประวัติการจอง',
    subtitle: 'ดูนัดหมายที่กำลังจะมาถึงและรายการที่เข้ารับบริการแล้วในตารางเดียว',
    all: 'ทั้งหมด',
    upcoming: 'กำลังจะมาถึง',
    completed: 'เสร็จสิ้นแล้ว',
    cancelled: 'ยกเลิกแล้ว',
    dateTime: 'วันและเวลา',
    department: 'แผนก',
    doctor: 'แพทย์',
    status: 'สถานะ',
    actions: 'จัดการ',
    reschedule: 'เลื่อนนัด',
    cancel: 'ยกเลิก',
    empty: 'ไม่พบรายการจองในตัวกรองนี้',
    cancelSuccess: 'ยกเลิกนัดหมายสำเร็จ',
    cancelConfirm: 'ยืนยันยกเลิกนัดหมายนี้หรือไม่?',
    cancelTooLate: 'สามารถยกเลิกนัดหมายได้ก่อนเวลานัดอย่างน้อย 1 ชั่วโมงเท่านั้น',
    reschedulePrompt: 'กรอกวันนัดใหม่ในรูปแบบ YYYY-MM-DD',
    rescheduleSuccess: 'เลื่อนนัดหมายสำเร็จ',
    loginNotice: 'เข้าสู่ระบบเพื่อโหลดประวัติการจองจริงจาก backend',
  },
};

const normalizeStatus = (status) => {
  if (status === 'completed') {
    return 'completed';
  }

  if (status === 'cancelled') {
    return 'cancelled';
  }

  return 'upcoming';
};

const mapApiAppointment = (appointment) => ({
  id: appointment.appointment_id,
  date: appointment.appointment_date,
  time: appointment.appointment_time,
  department: appointment.department,
  doctor: appointment.doctor_name,
  status: appointment.status,
});

function BookingHistory({ language = 'en' }) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [actionMessage, setActionMessage] = useState('');
  const [bookingRecords, setBookingRecords] = useState(fallbackBookings);
  const [isUsingFallback, setIsUsingFallback] = useState(true);
  const text = historyText[language];

  const refreshAppointments = useCallback(() => {
    const authSession = getAuthSession();

    if (!authSession?.user?.id) {
      return;
    }

    api.getPatientAppointments(authSession.user.id)
      .then((appointments) => {
        setBookingRecords(appointments.map(mapApiAppointment));
        setIsUsingFallback(false);
      })
      .catch((apiError) => {
        setActionMessage(apiError.message);
        setBookingRecords(fallbackBookings);
        setIsUsingFallback(true);
      });
  }, []);

  useEffect(() => {
    refreshAppointments();
  }, [refreshAppointments]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') {
      return bookingRecords;
    }

    return bookingRecords.filter((booking) => normalizeStatus(booking.status) === activeTab);
  }, [activeTab, bookingRecords]);

  const handleReschedule = async (booking) => {
    const newDate = window.prompt(text.reschedulePrompt, booking.date);

    if (!newDate) {
      return;
    }

    try {
      await api.rescheduleAppointment(booking.id, {
        new_date: newDate,
        new_time: booking.time,
      });
      setActionMessage(text.rescheduleSuccess);
      refreshAppointments();
    } catch (apiError) {
      setActionMessage(apiError.message);
    }
  };

  const handleCancel = async (booking) => {
    if (getMinutesUntilAppointment(booking) < 60) {
      setActionMessage(text.cancelTooLate);
      return;
    }

    if (!window.confirm(text.cancelConfirm)) {
      return;
    }

    try {
      await api.cancelAppointment(booking.id);
      setActionMessage(text.cancelSuccess);
      refreshAppointments();
    } catch (apiError) {
      setActionMessage(apiError.message);
    }
  };

  return (
    <main className="container py-5">
      <section className="card border-0 shadow-sm rounded-3 p-4 bg-white">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
            <div>
              <h3 className="fw-bold text-dark-blue mb-2">{text.title}</h3>
              <p className="text-muted mb-0">{text.subtitle}</p>
            </div>
          </div>

          {isUsingFallback && (
            <div className="alert alert-warning border-0">
              {text.loginNotice}
            </div>
          )}

          <ul className="nav nav-pills history-tabs mb-4">
            {tabs.map((tab) => (
              <li className="nav-item flex-fill text-center" key={tab}>
                <button
                  className={`nav-link w-100 fw-bold py-2 ${
                    activeTab === tab ? 'active' : 'text-secondary'
                  }`}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                >
                  {text[tab]}
                </button>
              </li>
            ))}
          </ul>

          <div className="table-responsive">
            <table className="table table-hover align-middle history-table">
              <thead className="table-light">
                <tr className="text-secondary">
                  <th className="py-3">{text.dateTime}</th>
                  <th className="py-3">{text.department}</th>
                  <th className="py-3">{text.doctor}</th>
                  <th className="py-3">{text.status}</th>
                  <th className="py-3 text-center">{text.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const normalizedStatus = normalizeStatus(booking.status);
                  const canCancel = getMinutesUntilAppointment(booking) >= 60;

                  return (
                    <tr key={booking.id}>
                      <td className="py-3">
                        <strong>{booking.date}</strong>
                        <span className="text-muted ms-2">{booking.time}</span>
                      </td>
                      <td>{booking.department}</td>
                      <td>{booking.doctor}</td>
                      <td>
                        {normalizedStatus === 'completed' ? (
                          <span className="badge history-badge-completed rounded-pill">
                            {text.completed}
                          </span>
                        ) : normalizedStatus === 'cancelled' ? (
                          <span className="badge text-bg-secondary rounded-pill px-3 py-2">
                            {text.cancelled}
                          </span>
                        ) : (
                          <span className="badge history-badge-upcoming rounded-pill">
                            {text.upcoming}
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        {normalizedStatus === 'upcoming' && !isUsingFallback ? (
                          <div className="d-flex gap-2 justify-content-center">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              type="button"
                              onClick={() => handleReschedule(booking)}
                            >
                              {text.reschedule}
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              type="button"
                              disabled={!canCancel}
                              title={!canCancel ? text.cancelTooLate : ''}
                              onClick={() => handleCancel(booking)}
                            >
                              {text.cancel}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {actionMessage && (
            <div className="alert alert-info border-0 mt-3 mb-0">
              {actionMessage}
            </div>
          )}

          {filteredBookings.length === 0 && (
            <div className="text-center text-muted py-5">
              {text.empty}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default BookingHistory;
