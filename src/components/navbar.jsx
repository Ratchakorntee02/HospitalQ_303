import { useState } from 'react';
import hptFront from '../assets/hptFront1.png';

const navText = {
  en: {
    home: 'Home',
    booking: 'Booking Queue',
    queueStatus: 'Queue Status',
    bookingHistory: 'Booking History',
    services: 'Services',
    annual: 'Annual Health Checkup',
    telemedicine: 'Telemedicine Consultation',
    contact: 'Contact US',
    search: 'Search',
    login: 'Login/Register',
    logout: 'Logout',
    doctorDashboard: 'Doctor Dashboard',
    adminDashboard: 'Admin Dashboard',
    language: 'Language',
  },
  th: {
    home: 'หน้าหลัก',
    booking: 'จองคิว',
    queueStatus: 'สถานะคิว',
    bookingHistory: 'ประวัติการจอง',
    services: 'บริการ',
    annual: 'ตรวจสุขภาพประจำปี',
    telemedicine: 'ปรึกษาแพทย์ออนไลน์',
    contact: 'ติดต่อเรา',
    search: 'ค้นหา',
    login: 'เข้าสู่ระบบ',
    logout: 'ออกจากระบบ',
    doctorDashboard: 'Doctor Dashboard',
    adminDashboard: 'Admin Dashboard',
    language: 'ภาษา',
  },
};

function Navbar({ currentPage, language, session, onLanguageChange, onLogout, onNavigate, onSearch }) {
  const [searchValue, setSearchValue] = useState('');
  const text = navText[language];

  const isActive = (page) => currentPage === page;

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    onSearch(searchValue);
    setSearchValue('');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#5283b4' }}>
      <div className="container">
        <button
          className="navbar-brand border-0 bg-transparent p-0"
          type="button"
          onClick={() => onNavigate('home')}
        >
          <img src={hptFront} alt="HPT Logo" style={{ height: '50px', objectFit: 'contain' }} />
        </button>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <button
                className={`nav-link nav-button text-white ${isActive('home') ? 'active fw-bold' : ''}`}
                type="button"
                aria-current={isActive('home') ? 'page' : undefined}
                onClick={() => onNavigate('home')}
              >
                {text.home}
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link nav-button text-white ${isActive('booking') ? 'active fw-bold' : ''}`}
                type="button"
                aria-current={isActive('booking') ? 'page' : undefined}
                onClick={() => onNavigate('booking')}
              >
                {text.booking}
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link nav-button text-white ${isActive('queue-status') ? 'active fw-bold' : ''}`}
                type="button"
                aria-current={isActive('queue-status') ? 'page' : undefined}
                onClick={() => onNavigate('queue-status')}
              >
                {text.queueStatus}
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link nav-button text-white ${isActive('booking-history') ? 'active fw-bold' : ''}`}
                type="button"
                aria-current={isActive('booking-history') ? 'page' : undefined}
                onClick={() => onNavigate('booking-history')}
              >
                {text.bookingHistory}
              </button>
            </li>

            <li className="nav-item dropdown">
              <button
                className={`nav-link nav-button dropdown-toggle text-white ${
                  isActive('annual-check') || isActive('telemedicine') || isActive('contact') ? 'active fw-bold' : ''
                }`}
                type="button"
                id="navbarDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {text.services}
              </button>
              <ul className="dropdown-menu" style={{ backgroundColor: '#5884b1' }} aria-labelledby="navbarDropdown">
                <li>
                  <button
                    className="dropdown-item text-white"
                    type="button"
                    onClick={() => onNavigate('annual-check')}
                  >
                    {text.annual}
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item text-white"
                    type="button"
                    onClick={() => onNavigate('telemedicine')}
                  >
                    {text.telemedicine}
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button
                    className="dropdown-item text-white"
                    type="button"
                    onClick={() => onNavigate('contact')}
                  >
                    {text.contact}
                  </button>
                </li>
              </ul>
            </li>

            {session?.role === 'doctor' && (
              <li className="nav-item">
                <button
                  className={`nav-link nav-button text-white ${isActive('doctor-dashboard') ? 'active fw-bold' : ''}`}
                  type="button"
                  aria-current={isActive('doctor-dashboard') ? 'page' : undefined}
                  onClick={() => onNavigate('doctor-dashboard')}
                >
                  {text.doctorDashboard}
                </button>
              </li>
            )}

            {session?.role === 'admin' && (
              <li className="nav-item">
                <button
                  className={`nav-link nav-button text-white ${isActive('admin-dashboard') ? 'active fw-bold' : ''}`}
                  type="button"
                  aria-current={isActive('admin-dashboard') ? 'page' : undefined}
                  onClick={() => onNavigate('admin-dashboard')}
                >
                  {text.adminDashboard}
                </button>
              </li>
            )}
          </ul>

          <form className="d-flex align-items-center" onSubmit={handleSearchSubmit}>
            <input
              className="form-control me-2"
              type="search"
              placeholder={text.search}
              aria-label={text.search}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <button className="btn btn-secondary me-2" type="submit">{text.search}</button>
            <div className="btn-group me-2" role="group" aria-label={text.language}>
              <button
                className={`btn btn-light btn-sm ${language === 'en' ? 'active' : ''}`}
                type="button"
                onClick={() => onLanguageChange('en')}
              >
                EN
              </button>
              <button
                className={`btn btn-light btn-sm ${language === 'th' ? 'active' : ''}`}
                type="button"
                onClick={() => onLanguageChange('th')}
              >
                TH
              </button>
            </div>
            <button
              className="btn btn-success navbar-auth-btn"
              type="button"
              onClick={session ? onLogout : () => onNavigate('auth')}
            >
              {session ? text.logout : text.login}
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
