import { useEffect, useState } from 'react';
import Navbar from './components/navbar.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AnnualCheck from './pages/AnnualCheck.jsx';
import Auth from './pages/Auth.jsx';
import BookingQ from './pages/BookingQ.jsx';
import BookingHistory from './pages/BookingHistory.jsx';
import Contact from './pages/Contact.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import QueueStatus from './pages/QueueStatus.jsx';
import TelemedicConsul from './pages/TelemedicConsul.jsx';
import { clearAuthSession, getAuthSession } from './services/api.js';
import './App.css';

const searchIndex = [
  {
    page: 'home',
    keywords: ['home', 'dashboard', 'welcome', 'hospital queue', 'appointment', 'next appointment', 'หน้าหลัก', 'แดชบอร์ด', 'นัดหมาย'],
  },
  {
    page: 'booking',
    keywords: ['booking', 'booking queue', 'book queue', 'new queue', 'appointment form', 'doctor', 'department', 'จองคิว', 'แพทย์', 'แผนก'],
  },
  {
    page: 'queue-status',
    keywords: ['queue status', 'status', 'queue', 'waiting', 'opd', 'current queue', 'live queue', 'สถานะคิว', 'คิว', 'รอคิว'],
  },
  {
    page: 'booking-history',
    keywords: ['history', 'booking history', 'appointment history', 'completed', 'upcoming', 'reschedule', 'cancel', 'ประวัติ', 'ประวัติการจอง', 'เลื่อนนัด', 'ยกเลิก'],
  },
  {
    page: 'annual-check',
    keywords: ['annual', 'annual check', 'checkup', 'health checkup', 'basic protection', 'silver vitality', 'gold premium', 'ตรวจสุขภาพ', 'สุขภาพประจำปี'],
  },
  {
    page: 'telemedicine',
    keywords: ['telemedicine', 'online doctor', 'video call', 'consultation', 'doctor online', 'ปรึกษาแพทย์ออนไลน์', 'วิดีโอคอล', 'พบแพทย์ออนไลน์'],
  },
  {
    page: 'contact',
    keywords: ['contact', 'contact us', 'emergency', '1669', 'phone', 'email', 'address', 'map', 'ติดต่อ', 'ฉุกเฉิน', 'อีเมล', 'แผนที่'],
  },
  {
    page: 'auth',
    keywords: ['login', 'register', 'sign in', 'account', 'patient account', 'password', 'เข้าสู่ระบบ', 'สมัครสมาชิก', 'บัญชี'],
  },
];

const appText = {
  en: {
    back: 'Back to Homepage',
    emptySearch: 'Please enter a search keyword.',
    noResult: (query) => `No result found for "${query}". Try booking, queue, history, contact, or login.`,
    found: (query) => `Search result for "${query}" opened.`,
    welcome: 'Welcome to the Hospital Queue!',
    nextAppointment: 'Your Next Appointment',
    date: 'Date:',
    time: 'Time:',
    doctor: 'Doctor:',
    department: 'Department:',
    queueStatus: 'Your Queue Status',
    queueId: 'Queue ID:',
    waiting: '- Status: Waiting (30 mins)',
    viewQueue: 'View Queue Status',
    recentHistory: 'Recent Booking History',
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
    nextAppointment: 'นัดหมายถัดไปของคุณ',
    date: 'วันที่:',
    time: 'เวลา:',
    doctor: 'แพทย์:',
    department: 'แผนก:',
    queueStatus: 'สถานะคิวของคุณ',
    queueId: 'รหัสคิว:',
    waiting: '- สถานะ: รอคิว (30 นาที)',
    viewQueue: 'ดูสถานะคิว',
    recentHistory: 'ประวัติการจองล่าสุด',
    bookQueue: 'จองคิวใหม่',
    stepDepartment: 'แผนก',
    stepDateTime: 'วันและเวลา',
    stepConfirm: 'ยืนยัน',
    viewHistory: 'ดูประวัติการจอง',
    startBooking: 'เริ่มจองคิว',
  },
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [language, setLanguage] = useState('en');
  const [searchMessage, setSearchMessage] = useState('');
  const [session, setSession] = useState(() => getAuthSession());
  const text = appText[language];

  useEffect(() => {
    if (!searchMessage) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setSearchMessage('');
    }, 4000);

    return () => window.clearTimeout(timerId);
  }, [searchMessage]);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSearchMessage('');
  };

  const handleAuthSuccess = (nextSession) => {
    setSession(nextSession);

    if (nextSession?.role === 'doctor') {
      handleNavigate('doctor-dashboard');
      return;
    }

    if (nextSession?.role === 'admin') {
      handleNavigate('admin-dashboard');
      return;
    }

    handleNavigate('home');
  };

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
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
        onClick={() => handleNavigate('home')}
      >
        {text.back}
      </button>
    </div>
  );

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
      ) : currentPage === 'admin-dashboard' ? (
        <>
          {backButton}
          <AdminDashboard language={language} />
        </>
      ) : (
        <main className="container py-5">
          <div className="text-center mb-5">
            <h1 className="fw-bold text-dark-blue">
              {text.welcome}
            </h1>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-3">
                <div className="card-body">
                  <h4 className="card-title fw-bold mb-4 text-dark-blue">
                    {text.nextAppointment}
                  </h4>
                  <hr />
                  <div className="mt-3 fs-5 text-start">
                    <p><strong>{text.date}</strong> May 22, 2026</p>
                    <p><strong>{text.time}</strong> 10:30 AM</p>
                    <p><strong>{text.doctor}</strong> Dr. Stone</p>
                    <p><strong>{text.department}</strong> General Medicine</p>
                  </div>
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
                  <div className="mt-4 text-start">
                    <h5 className="mb-4">
                      <strong>{text.queueId}</strong>{' '}
                      <span className="text-primary fw-bold">OPD 692201</span>
                      <span className="text-muted ms-2 fs-6">
                        {text.waiting}
                      </span>
                    </h5>

                    <div className="d-flex gap-2 mt-3">
                      <div className="queue-bar active"></div>
                      <div className="queue-bar active"></div>
                      <div className="queue-bar active"></div>
                      <div className="queue-bar"></div>
                      <div className="queue-bar"></div>
                    </div>

                    <button
                      className="btn btn-outline-primary mt-4"
                      type="button"
                      onClick={() => handleNavigate('queue-status')}
                    >
                      {text.viewQueue}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-3">
                <div className="card-body">
                  <h4 className="card-title fw-bold mb-4 text-dark-blue">
                    {text.recentHistory}
                  </h4>

                  <div className="table-responsive mt-3">
                    <table className="table table-hover align-middle">
                      <thead>
                        <tr className="text-secondary">
                          <th>{text.date.replace(':', '')}</th>
                          <th>{text.time.replace(':', '')}</th>
                          <th>{text.doctor.replace(':', '')}</th>
                          <th>{text.department.replace(':', '')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>May 22, 2026</td>
                          <td>10:30 AM</td>
                          <td>Dr. Stone</td>
                          <td>General Medicine</td>
                        </tr>
                        <tr>
                          <td>June 3, 2026</td>
                          <td>01:30 PM</td>
                          <td>Dr. Strang</td>
                          <td>Dental</td>
                        </tr>
                        <tr>
                          <td>June 15, 2026</td>
                          <td>09:00 AM</td>
                          <td>Dr. Black Jack</td>
                          <td>General Medicine</td>
                        </tr>
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
                    onClick={() => handleNavigate('booking')}
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
