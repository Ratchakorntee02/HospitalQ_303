import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/navbar.jsx';
import AnnualCheck from './pages/AnnualCheck.jsx';
import Auth from './pages/Auth.jsx';
import BookingQ from './pages/BookingQ.jsx';
import BookingHistory from './pages/BookingHistory.jsx';
import Contact from './pages/Contact.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import QueueStatus from './pages/QueueStatus.jsx';
import Profile from './pages/Profile.jsx';
import TelemedicConsul from './pages/TelemedicConsul.jsx';
import { api, clearAuthSession, getAuthSession } from './services/api.js';
import './App.css';

const searchIndex = [
  { page: 'home', keywords: ['home', 'dashboard', 'welcome', 'hospital queue', 'appointment', 'next appointment', 'หน้าหลัก', 'แดชบอร์ด', 'นัดหมาย'] },
  { page: 'booking', keywords: ['booking', 'booking queue', 'book queue', 'new queue', 'appointment form', 'doctor', 'department', 'จองคิว', 'แพทย์', 'แผนก'] },
  { page: 'queue-status', keywords: ['queue status', 'status', 'queue', 'waiting', 'opd', 'current queue', 'live queue', 'สถานะคิว', 'คิว', 'รอคิว'] },
  { page: 'booking-history', keywords: ['history', 'booking history', 'appointment history', 'completed', 'upcoming', 'reschedule', 'cancel', 'ประวัติ', 'ประวัติการจอง', 'เลื่อนนัด', 'ยกเลิก'] },
  { page: 'annual-check', keywords: ['annual', 'annual check', 'checkup', 'health checkup', 'basic protection', 'silver vitality', 'gold premium', 'ตรวจสุขภาพ', 'สุขภาพประจำปี'] },
  { page: 'telemedicine', keywords: ['telemedicine', 'online doctor', 'video call', 'consultation', 'doctor online', 'ปรึกษาแพทย์ออนไลน์', 'วิดีโอคอล', 'พบแพทย์ออนไลน์'] },
  { page: 'contact', keywords: ['contact', 'contact us', 'emergency', '1669', 'phone', 'email', 'address', 'map', 'ติดต่อ', 'ฉุกเฉิน', 'อีเมล', 'แผนที่'] },
  { page: 'auth', keywords: ['login', 'register', 'sign in', 'account', 'patient account', 'password', 'เข้าสู่ระบบ', 'สมัครสมาชิก', 'บัญชี'] },
  { page: 'profile', keywords: ['profile', 'personal information', 'account information', 'ข้อมูลส่วนตัว', 'โปรไฟล์', 'บัญชี'] },
];

const appText = {
  en: {
    back: 'Back to Homepage',
    emptySearch: 'Please enter a search keyword.',
    noResult: (query) => `No result found for "${query}". Try booking, queue, history, contact, or login.`,
    found: (query) => `Search result for "${query}" opened.`,
    welcome: 'Welcome to the Hospital Queue!',
    welcomeUser: (name) => `Welcome ${name} to the Hospital Queue!`,
    nextAppointment: 'Your Next Appointment',
    date: 'Date:',
    time: 'Time:',
    doctor: 'Doctor:',
    department: 'Department:',
    status: 'Status:',
    queueStatus: 'Your Queue Status',
    queueId: 'Queue Number:',
    waiting: 'Status:',
    completedQueues: 'completed',
    queueProgress: 'Queue progress:',
    viewQueue: 'View Queue Status',
    recentHistory: 'Recent Booking History',
    noAppointment: 'You do not have an appointment yet.',
    noHistory: 'No booking history found.',
    loginToSee: 'Please login to view your appointment information.',
    loading: 'Loading your appointment information...',
    bookQueue: 'Book a New Queue',
    stepDepartment: 'Department',
    stepDateTime: 'Date & Time',
    stepConfirm: 'Confirm',
    viewHistory: 'View Booking History',
    startBooking: 'Start Booking',
  },
  th: {
    back: 'กลับหน้าหลัก',
    emptySearch: 'กรุณาพิมพ์คำค้นหาก่อน',
    noResult: (query) => `ไม่พบผลลัพธ์สำหรับ "${query}" ลองค้นหา จองคิว, คิว, ประวัติ, ติดต่อ หรือเข้าสู่ระบบ`,
    found: (query) => `เปิดผลการค้นหาสำหรับ "${query}" แล้ว`,
    welcome: 'ยินดีต้อนรับสู่ระบบ Hospital Queue',
    welcomeUser: (name) => `ยินดีต้อนรับ ${name} สู่ระบบ Hospital Queue`,
    nextAppointment: 'นัดหมายถัดไปของคุณ',
    date: 'วันที่:',
    time: 'เวลา:',
    doctor: 'แพทย์:',
    department: 'แผนก:',
    status: 'สถานะ:',
    queueStatus: 'สถานะคิวของคุณ',
    queueId: 'หมายเลขคิว:',
    waiting: 'สถานะ:',
    completedQueues: 'เสร็จสิ้น',
    queueProgress: 'ความคืบหน้าคิว:',
    viewQueue: 'ดูสถานะคิว',
    recentHistory: 'ประวัติการจองล่าสุด',
    noAppointment: 'ยังไม่มีรายการนัดหมาย',
    noHistory: 'ยังไม่มีประวัติการจอง',
    loginToSee: 'กรุณาเข้าสู่ระบบเพื่อดูข้อมูลนัดหมายของคุณ',
    loading: 'กำลังโหลดข้อมูลนัดหมายของคุณ...',
    bookQueue: 'จองคิวใหม่',
    stepDepartment: 'แผนก',
    stepDateTime: 'วันและเวลา',
    stepConfirm: 'ยืนยัน',
    viewHistory: 'ดูประวัติการจอง',
    startBooking: 'เริ่มจองคิว',
  },
};

const formatDate = (dateValue) => {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
};

const formatTime = (timeValue) => {
  if (!timeValue) return '-';
  return String(timeValue).slice(0, 5);
};

const getStatusLabel = (status, language = 'en') => {
  const labels = {
    en: { confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' },
    th: { confirmed: 'ยืนยันแล้ว', completed: 'เสร็จสิ้นแล้ว', cancelled: 'ยกเลิกแล้ว' },
  };
  return labels[language]?.[status] || status || '-';
};

const getQueueBars = (appointment) => {
  const totalQueues = Math.max(1, Number(appointment?.total_queues || 1));
  const visibleSteps = Math.min(5, totalQueues);
  const completedQueues = Number(appointment?.completed_queues || 0);
  const hasCallingQueue = appointment?.calling_queue && appointment.calling_queue !== '-';
  const activeFromProgress = Math.min(totalQueues, completedQueues + (hasCallingQueue ? 1 : 0));
  const activeSteps = Math.max(1, Math.ceil((activeFromProgress / totalQueues) * visibleSteps));

  return Array.from({ length: visibleSteps }, (_, index) => ({
    index,
    active: index < activeSteps,
  }));
};

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const storedSession = getAuthSession();
    return storedSession?.role === 'doctor' ? 'doctor-dashboard' : 'home';
  });
  const [language, setLanguage] = useState('en');
  const [searchMessage, setSearchMessage] = useState('');
  const [session, setSession] = useState(() => getAuthSession());
  const [homeAppointments, setHomeAppointments] = useState([]);
  const [homeLoading, setHomeLoading] = useState(false);
  const [homeError, setHomeError] = useState('');
  const text = appText[language];

  useEffect(() => {
    if (!searchMessage) return undefined;
    const timerId = window.setTimeout(() => setSearchMessage(''), 4000);
    return () => window.clearTimeout(timerId);
  }, [searchMessage]);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!session?.token || session?.role !== 'patient' || !session?.user?.id) {
        setHomeAppointments([]);
        return;
      }

      try {
        setHomeLoading(true);
        setHomeError('');
        const appointments = await api.getPatientAppointments(session.user.id);
        setHomeAppointments(Array.isArray(appointments) ? appointments : []);
      } catch (error) {
        setHomeError(error.message);
        setHomeAppointments([]);
      } finally {
        setHomeLoading(false);
      }
    };

    if (currentPage === 'home') {
      loadAppointments();
    }
  }, [currentPage, session]);

  const upcomingAppointment = useMemo(() => {
    const now = new Date();

    return homeAppointments
      .filter((appointment) => appointment.status === 'confirmed')
      .map((appointment) => ({
        ...appointment,
        appointmentDateTime: new Date(`${appointment.appointment_date}T${appointment.appointment_time || '00:00:00'}`),
      }))
      .filter((appointment) => appointment.appointmentDateTime >= now)
      .sort((a, b) => a.appointmentDateTime - b.appointmentDateTime)[0] || null;
  }, [homeAppointments]);

  const recentAppointments = useMemo(() => homeAppointments.slice(0, 3), [homeAppointments]);

  const handleNavigate = (page) => {
    const patientOnlyPages = ['booking', 'queue-status', 'booking-history'];

    if (patientOnlyPages.includes(page) && !session?.token) {
      setCurrentPage('auth');
      setSearchMessage('Please login before using this feature.');
      return;
    }

    if (session?.role === 'doctor' && ['home', ...patientOnlyPages, 'annual-check', 'telemedicine'].includes(page)) {
      setCurrentPage('doctor-dashboard');
      setSearchMessage('Doctor accounts use the Doctor Dashboard. Please use a patient account to book an appointment.');
      return;
    }

    if (page === 'profile' && !session?.token) {
      setCurrentPage('auth');
      setSearchMessage('Please login before opening your profile.');
      return;
    }

    setCurrentPage(page);
    setSearchMessage('');
  };

  const handleAuthSuccess = (nextSession) => {
    setSession(nextSession);

    if (nextSession?.role === 'doctor') {
      handleNavigate('doctor-dashboard');
      return;
    }

    handleNavigate('home');
  };

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
    setHomeAppointments([]);
    handleNavigate('home');
  };

  const handleSearch = (query) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      setSearchMessage(text.emptySearch);
      return;
    }

    const matchedItem = searchIndex.find((item) =>
      item.keywords.some((keyword) => keyword.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(keyword.toLowerCase())),
    );

    if (!matchedItem) {
      setSearchMessage(text.noResult(query));
      return;
    }

    setCurrentPage(matchedItem.page);
    setSearchMessage(text.found(query));
  };

  const backButton = (
    <div className="container pt-4">
      <button
        className="btn btn-light border"
        type="button"
        onClick={() => handleNavigate(session?.role === 'doctor' ? 'doctor-dashboard' : 'home')}
      >
        {text.back}
      </button>
    </div>
  );

  const isPatientLoggedIn = session?.role === 'patient';
  const welcomeName = session?.user?.name?.trim();

  return (
    <div className="app-shell bg-light-hospital">
      <Navbar
        currentPage={currentPage}
        language={language}
        session={session}
        onLanguageChange={setLanguage}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onSearch={handleSearch}
      />

      {searchMessage && (
        <div className="container pt-3">
          <div className="alert alert-info border-0 shadow-sm mb-0 search-feedback">
            {searchMessage}
          </div>
        </div>
      )}

      {currentPage === 'booking' ? (
        <>
          {backButton}
          <BookingQ language={language} />
        </>
      ) : currentPage === 'queue-status' ? (
        <>
          {backButton}
          <QueueStatus language={language} />
        </>
      ) : currentPage === 'booking-history' ? (
        <>
          {backButton}
          <BookingHistory language={language} />
        </>
      ) : currentPage === 'annual-check' ? (
        <>
          {backButton}
          <AnnualCheck language={language} />
        </>
      ) : currentPage === 'telemedicine' ? (
        <>
          {backButton}
          <TelemedicConsul language={language} />
        </>
      ) : currentPage === 'profile' ? (
        <>
          {backButton}
          <Profile
            language={language}
            onProfileUpdated={(nextSession) => setSession(nextSession)}
          />
        </>
      ) : currentPage === 'contact' ? (
        <>
          {backButton}
          <Contact language={language} />
        </>
      ) : currentPage === 'auth' ? (
        <>
          {backButton}
          <Auth language={language} onAuthSuccess={handleAuthSuccess} />
        </>
      ) : currentPage === 'doctor-dashboard' ? (
        <>
          {backButton}
          <DoctorDashboard language={language} />
        </>
      ) : (
        <main className="container py-5">
          <div className="text-center mb-5">
            <h1 className="fw-bold text-dark-blue">
              {welcomeName ? text.welcomeUser(welcomeName) : text.welcome}
            </h1>
          </div>

          {homeError && (
            <div className="alert alert-warning border-0 shadow-sm">
              {homeError}
            </div>
          )}

          {homeLoading && (
            <div className="alert alert-info border-0 shadow-sm">
              {text.loading}
            </div>
          )}

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-3">
                <div className="card-body">
                  <h4 className="card-title fw-bold mb-4 text-dark-blue">
                    {text.nextAppointment}
                  </h4>
                  <hr />

                  {!isPatientLoggedIn ? (
                    <p className="text-muted fs-5 mb-0">{text.loginToSee}</p>
                  ) : upcomingAppointment ? (
                    <div className="mt-3 fs-5 text-start">
                      <p><strong>{text.date}</strong> {formatDate(upcomingAppointment.appointment_date)}</p>
                      <p><strong>{text.time}</strong> {formatTime(upcomingAppointment.appointment_time)}</p>
                      <p><strong>{text.doctor}</strong> {upcomingAppointment.doctor_name || '-'}</p>
                      <p><strong>{text.department}</strong> {upcomingAppointment.department || '-'}</p>
                      <p><strong>{text.status}</strong> {getStatusLabel(upcomingAppointment.status, language)}</p>
                    </div>
                  ) : (
                    <p className="text-muted fs-5 mb-0">{text.noAppointment}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-3">
                <div className="card-body">
                  <h4 className="card-title fw-bold mb-4 text-dark-blue">
                    {text.queueStatus}
                  </h4>
                  <hr />

                  {isPatientLoggedIn && upcomingAppointment ? (
                    <div className="mt-4 text-start">
                      <h5 className="mb-4">
                        <strong>{text.queueId}</strong>{' '}
                        <span className="text-primary fw-bold">{upcomingAppointment.queue_no || upcomingAppointment.appointment_id}</span>
                        <span className="text-muted ms-2 fs-6">
                          {text.waiting} {getStatusLabel(upcomingAppointment.status, language)}
                        </span>
                      </h5>

                      <div className="d-flex gap-2 mt-3">
                        {getQueueBars(upcomingAppointment).map((bar) => (
                          <div
                            className={`queue-bar ${bar.active ? 'active' : ''}`}
                            key={bar.index}
                          ></div>
                        ))}
                      </div>
                      <p className="text-muted small mt-2 mb-0">
                        {text.queueProgress} {upcomingAppointment.completed_queues || 0}/{upcomingAppointment.total_queues || 1} {text.completedQueues}
                      </p>

                      <button
                        className="btn btn-outline-primary mt-4"
                        type="button"
                        onClick={() => handleNavigate('queue-status')}
                      >
                        {text.viewQueue}
                      </button>
                    </div>
                  ) : (
                    <p className="text-muted fs-5 mb-0">{isPatientLoggedIn ? text.noAppointment : text.loginToSee}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-3">
                <div className="card-body">
                  <h4 className="card-title fw-bold mb-4 text-dark-blue">
                    {text.recentHistory}
                  </h4>

                  {!isPatientLoggedIn ? (
                    <p className="text-muted fs-5 mb-0">{text.loginToSee}</p>
                  ) : recentAppointments.length > 0 ? (
                    <>
                      <div className="table-responsive mt-3">
                        <table className="table table-hover align-middle">
                          <thead>
                            <tr className="text-secondary">
                              <th>{text.date.replace(':', '')}</th>
                              <th>{text.time.replace(':', '')}</th>
                              <th>{text.doctor.replace(':', '')}</th>
                              <th>{text.status.replace(':', '')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentAppointments.map((appointment) => (
                              <tr key={appointment.appointment_id}>
                                <td>{formatDate(appointment.appointment_date)}</td>
                                <td>{formatTime(appointment.appointment_time)}</td>
                                <td>{appointment.doctor_name || '-'}</td>
                                <td>{getStatusLabel(appointment.status, language)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <button
                        className="btn btn-outline-primary mt-3"
                        type="button"
                        onClick={() => handleNavigate('booking-history')}
                      >
                        {text.viewHistory}
                      </button>
                    </>
                  ) : (
                    <p className="text-muted fs-5 mb-0">{text.noHistory}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-3">
                <div className="card-body">
                  <h4 className="card-title fw-bold mb-4 text-dark-blue">
                    {text.bookQueue}
                  </h4>
                  <hr />

                  <div className="step-wrapper mt-5 px-3">
                    <div className="step-line"></div>

                    <div className="step-item">
                      <div className="step-circle active">1</div>
                      <small className="fw-medium d-block mt-2">{text.stepDepartment}</small>
                    </div>

                    <div className="step-item">
                      <div className="step-circle">2</div>
                      <small className="text-muted d-block mt-2">{text.stepDateTime}</small>
                    </div>

                    <div className="step-item">
                      <div className="step-circle">3</div>
                      <small className="text-muted d-block mt-2">{text.stepConfirm}</small>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary mt-4"
                    type="button"
                    onClick={() => handleNavigate(session?.token ? 'booking' : 'auth')}
                  >
                    {text.startBooking}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
