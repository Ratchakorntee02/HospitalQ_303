import { useMemo, useState } from 'react';

const bookings = [
  {
    id: 'apt-001',
    date: 'May 22, 2026',
    time: '10:30 AM',
    department: 'General Medicine',
    doctor: 'Dr. Stone',
    status: 'upcoming',
  },
  {
    id: 'apt-002',
    date: 'June 3, 2026',
    time: '01:30 PM',
    department: 'Dental Clinic',
    doctor: 'Dr. Strang',
    status: 'upcoming',
  },
  {
    id: 'apt-003',
    date: 'April 18, 2026',
    time: '09:00 AM',
    department: 'General Medicine',
    doctor: 'Dr. Ratchakorn',
    status: 'completed',
  },
  {
    id: 'apt-004',
    date: 'March 12, 2026',
    time: '02:00 PM',
    department: 'Pediatrics',
    doctor: 'Dr. Nopparat',
    status: 'completed',
  },
];

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
];

const historyText = {
  en: {
    title: 'Booking History',
    subtitle: 'Review upcoming appointments and completed visits in one clean table.',
    all: 'All',
    upcoming: 'Upcoming',
    completed: 'Completed',
    dateTime: 'Date & Time',
    department: 'Department',
    doctor: 'Doctor',
    status: 'Status',
    actions: 'Actions',
    reschedule: 'Reschedule',
    cancel: 'Cancel',
    empty: 'No booking records found for this filter.',
  },
  th: {
    title: 'ประวัติการจอง',
    subtitle: 'ดูนัดหมายที่กำลังจะมาถึงและรายการที่เข้ารับบริการแล้วในตารางเดียว',
    all: 'ทั้งหมด',
    upcoming: 'กำลังจะมาถึง',
    completed: 'เสร็จสิ้นแล้ว',
    dateTime: 'วันและเวลา',
    department: 'แผนก',
    doctor: 'แพทย์',
    status: 'สถานะ',
    actions: 'จัดการ',
    reschedule: 'เลื่อนนัด',
    cancel: 'ยกเลิก',
    empty: 'ไม่พบรายการจองในตัวกรองนี้',
  },
};

function BookingHistory({ language = 'en' }) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [actionMessage, setActionMessage] = useState('');
  const text = historyText[language];

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') {
      return bookings;
    }

    return bookings.filter((booking) => booking.status === activeTab);
  }, [activeTab]);

  const handleReschedule = (booking) => {
    setActionMessage(`${text.reschedule}: ${booking.date} ${booking.time}`);
  };

  const handleCancel = (booking) => {
    setActionMessage(`${text.cancel}: ${booking.date} ${booking.time}`);
  };

  return (
    <main className="container py-5">
      <section className="card border-0 shadow-sm rounded-3 p-4 bg-white">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
            <div>
              <h3 className="fw-bold text-dark-blue mb-2">{text.title}</h3>
              <p className="text-muted mb-0">
                {text.subtitle}
              </p>
            </div>
          </div>

          <ul className="nav nav-pills history-tabs mb-4">
            {tabs.map((tab) => (
              <li className="nav-item flex-fill text-center" key={tab.id}>
                <button
                  className={`nav-link w-100 fw-bold py-2 ${
                    activeTab === tab.id ? 'active' : 'text-secondary'
                  }`}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                >
                  {text[tab.id]}
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
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="py-3">
                      <strong>{booking.date}</strong>
                      <span className="text-muted ms-2">{booking.time}</span>
                    </td>
                    <td>{booking.department}</td>
                    <td>{booking.doctor}</td>
                    <td>
                      {booking.status === 'completed' ? (
                        <span className="badge history-badge-completed rounded-pill">
                          {text.completed}
                        </span>
                      ) : (
                        <span className="badge history-badge-upcoming rounded-pill">
                          {text.upcoming}
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      {booking.status === 'upcoming' ? (
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
                ))}
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
