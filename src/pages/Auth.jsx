import { useState } from 'react';
import { api, saveAuthSession } from '../services/api.js';

const initialLoginData = {
  identifier: '',
  password: '',
};

const initialRegisterData = {
  fullName: '',
  patientId: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  bloodType: '',
  allergies: '',
  chronicDiseases: '',
  currentMedications: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  password: '',
  confirmPassword: '',
};

const authText = {
  en: {
    eyebrow: 'Patient Account',
    title: 'Manage Your Hospital Queue Easily',
    subtitle: 'Sign in to book appointments, check queue status, review booking history, and access online hospital services.',
    benefits: ['Fast queue booking', 'Real-time queue status', 'Appointment history tracking'],
    login: 'Login',
    register: 'Register',
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Log in with your email, username, or patient ID.',
    identifier: 'Email / Username / Patient ID',
    password: 'Password',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    registerTitle: 'Create Patient Account',
    registerSubtitle: 'Register once to access queue and appointment services.',
    accountSection: 'Account Information',
    medicalSection: 'Medical Profile',
    emergencySection: 'Emergency Contact',
    fullName: 'Full Name',
    patientId: 'Patient ID / Citizen ID',
    email: 'Email',
    phone: 'Phone Number',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    selectGender: '-- Select gender --',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    bloodType: 'Blood Type',
    selectBloodType: '-- Select blood type --',
    allergies: 'Allergic to medicine',
    allergiesPlaceholder: 'Example: Penicillin, seafood, none',
    chronicDiseases: 'Chronic Diseases',
    chronicPlaceholder: 'Example: Diabetes, hypertension, asthma, none',
    currentMedications: 'Current Medications',
    medicationPlaceholder: 'Example: Metformin, blood pressure medication, none',
    emergencyContactName: 'Emergency Contact Name',
    emergencyContactPhone: 'Emergency Contact Phone',
    confirmPassword: 'Confirm Password',
    create: 'Create Account',
    requiredHint: '*',
    loginSuccess: 'Login successful. Welcome back to Hospital Queue.',
    registerSuccess: 'Registration successful. Your patient profile has been saved.',
    passwordError: 'Password and confirm password do not match.',
  },
  th: {
    eyebrow: 'บัญชีผู้ป่วย',
    title: 'จัดการคิวโรงพยาบาลได้ง่ายขึ้น',
    subtitle: 'เข้าสู่ระบบเพื่อจองนัด ตรวจสถานะคิว ดูประวัติการจอง และใช้บริการออนไลน์ของโรงพยาบาล',
    benefits: ['จองคิวได้รวดเร็ว', 'ดูสถานะคิวแบบเรียลไทม์', 'ติดตามประวัติการนัดหมาย'],
    login: 'เข้าสู่ระบบ',
    register: 'สมัครสมาชิก',
    loginTitle: 'ยินดีต้อนรับกลับ',
    loginSubtitle: 'เข้าสู่ระบบด้วยอีเมล ชื่อผู้ใช้ หรือรหัสผู้ป่วย',
    identifier: 'อีเมล / ชื่อผู้ใช้ / รหัสผู้ป่วย',
    password: 'รหัสผ่าน',
    remember: 'จดจำฉันไว้',
    forgot: 'ลืมรหัสผ่าน?',
    registerTitle: 'สร้างบัญชีผู้ป่วย',
    registerSubtitle: 'สมัครครั้งเดียวเพื่อใช้บริการจองคิวและบันทึกประวัติผู้ป่วย',
    accountSection: 'ข้อมูลบัญชี',
    medicalSection: 'ประวัติสุขภาพ',
    emergencySection: 'ผู้ติดต่อฉุกเฉิน',
    fullName: 'ชื่อ-นามสกุล',
    patientId: 'รหัสผู้ป่วย / เลขบัตรประชาชน',
    email: 'อีเมล',
    phone: 'เบอร์โทรศัพท์',
    dateOfBirth: 'วันเกิด',
    gender: 'เพศ',
    selectGender: '-- เลือกเพศ --',
    male: 'ชาย',
    female: 'หญิง',
    other: 'อื่น ๆ',
    bloodType: 'หมู่เลือด',
    selectBloodType: '-- เลือกหมู่เลือด --',
    allergies: 'แพ้ยา / แพ้อาหาร',
    allergiesPlaceholder: 'เช่น Penicillin, อาหารทะเล, ไม่มี',
    chronicDiseases: 'โรคประจำตัว',
    chronicPlaceholder: 'เช่น เบาหวาน, ความดัน, หอบหืด, ไม่มี',
    currentMedications: 'ยาที่ใช้อยู่',
    medicationPlaceholder: 'เช่น Metformin, ยาความดัน, ไม่มี',
    emergencyContactName: 'ชื่อผู้ติดต่อฉุกเฉิน',
    emergencyContactPhone: 'เบอร์ผู้ติดต่อฉุกเฉิน',
    confirmPassword: 'ยืนยันรหัสผ่าน',
    create: 'สร้างบัญชี',
    requiredHint: '*',
    loginSuccess: 'เข้าสู่ระบบสำเร็จ ยินดีต้อนรับกลับสู่ Hospital Queue',
    registerSuccess: 'สมัครสมาชิกสำเร็จ ระบบบันทึกประวัติผู้ป่วยของคุณแล้ว',
    passwordError: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน',
  },
};

function RequiredMark({ text }) {
  return <span className="auth-required-mark">{text}</span>;
}

function Auth({ language = 'en', onAuthSuccess }) {
  const [activeMode, setActiveMode] = useState('login');
  const [loginData, setLoginData] = useState(initialLoginData);
  const [registerData, setRegisterData] = useState(initialRegisterData);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const text = authText[language];

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const switchMode = (mode) => {
    setActiveMode(mode);
    setMessage('');
    setError('');
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const result = await api.login({
        email: loginData.identifier,
        password: loginData.password,
      });

      const nextSession = {
        token: result.token,
        role: result.role,
        user: result.user,
      };

      saveAuthSession(nextSession);
      setMessage(text.loginSuccess);
      setLoginData(initialLoginData);
      onAuthSuccess?.(nextSession);
    } catch (apiError) {
      setError(apiError.message);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (registerData.password !== registerData.confirmPassword) {
      setError(text.passwordError);
      return;
    }

    try {
      await api.register({
        name: registerData.fullName,
        phone: registerData.phone,
        citizen_id: registerData.patientId,
        email: registerData.email,
        password: registerData.password,
        birth_date: registerData.dateOfBirth,
        gender: registerData.gender,
        blood_type: registerData.bloodType,
        allergies: registerData.allergies,
        chronic_diseases: registerData.chronicDiseases,
        current_medications: registerData.currentMedications,
        emergency_contact_name: registerData.emergencyContactName,
        emergency_contact_phone: registerData.emergencyContactPhone,
      });

      setError('');
      setMessage(text.registerSuccess);
      setRegisterData(initialRegisterData);
      setActiveMode('login');
    } catch (apiError) {
      setError(apiError.message);
    }
  };

  return (
    <main className="container py-5 auth-page">
      <section className="row g-4 align-items-stretch">
        <div className="col-lg-5">
          <div className="auth-info-panel h-100">
            <p className="auth-eyebrow mb-2">{text.eyebrow}</p>
            <h2 className="fw-bold mb-3">{text.title}</h2>
            <p className="text-white-75 mb-4">
              {text.subtitle}
            </p>

            <div className="auth-benefit-list">
              {text.benefits.map((benefit) => (
                <div className="auth-benefit-item" key={benefit}>{benefit}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-3 bg-white h-100">
            <div className="card-body p-4 p-md-5">
              <div className="auth-tabs mb-4">
                <button
                  className={`auth-tab ${activeMode === 'login' ? 'active' : ''}`}
                  type="button"
                  onClick={() => switchMode('login')}
                >
                  {text.login}
                </button>
                <button
                  className={`auth-tab ${activeMode === 'register' ? 'active' : ''}`}
                  type="button"
                  onClick={() => switchMode('register')}
                >
                  {text.register}
                </button>
              </div>

              {message && (
                <div className="alert alert-success border-0">
                  {message}
                </div>
              )}

              {error && (
                <div className="alert alert-danger border-0">
                  {error}
                </div>
              )}

              {activeMode === 'login' ? (
                <form onSubmit={handleLoginSubmit}>
                  <h3 className="fw-bold text-dark-blue mb-2">{text.loginTitle}</h3>
                  <p className="text-muted mb-4">{text.loginSubtitle}</p>

                  <div className="mb-3">
                    <label className="form-label fw-medium" htmlFor="login-identifier">
                      {text.identifier}
                    </label>
                    <input
                      id="login-identifier"
                      name="identifier"
                      type="text"
                      className="form-control form-control-lg"
                      required
                      value={loginData.identifier}
                      onChange={handleLoginChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium" htmlFor="login-password">
                      {text.password}
                    </label>
                    <input
                      id="login-password"
                      name="password"
                      type="password"
                      className="form-control form-control-lg"
                      required
                      value={loginData.password}
                      onChange={handleLoginChange}
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                    <label className="form-check-label text-muted">
                      <input className="form-check-input me-2" type="checkbox" />
                      {text.remember}
                    </label>
                    <button className="btn btn-link p-0 auth-link" type="button">
                      {text.forgot}
                    </button>
                  </div>

                  <button className="btn btn-lg text-white w-100 hospital-primary-btn py-3" type="submit">
                    {text.login}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit}>
                  <h3 className="fw-bold text-dark-blue mb-2">{text.registerTitle}</h3>
                  <p className="text-muted mb-4">{text.registerSubtitle}</p>

                  <h5 className="auth-section-title">{text.accountSection}</h5>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-medium" htmlFor="register-name">
                        {text.fullName}
                      </label>
                      <input
                        id="register-name"
                        name="fullName"
                        type="text"
                        className="form-control"
                        value={registerData.fullName}
                        onChange={handleRegisterChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium" htmlFor="register-patient-id">
                        {text.patientId} <RequiredMark text={text.requiredHint} />
                      </label>
                      <input
                        id="register-patient-id"
                        name="patientId"
                        type="text"
                        className="form-control"
                        required
                        value={registerData.patientId}
                        onChange={handleRegisterChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium" htmlFor="register-email">
                        {text.email} <RequiredMark text={text.requiredHint} />
                      </label>
                      <input
                        id="register-email"
                        name="email"
                        type="email"
                        className="form-control"
                        required
                        value={registerData.email}
                        onChange={handleRegisterChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium" htmlFor="register-phone">
                        {text.phone} <RequiredMark text={text.requiredHint} />
                      </label>
                      <input
                        id="register-phone"
                        name="phone"
                        type="tel"
                        className="form-control"
                        required
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium" htmlFor="register-password">
                        {text.password} <RequiredMark text={text.requiredHint} />
                      </label>
                      <input
                        id="register-password"
                        name="password"
                        type="password"
                        className="form-control"
                        required
                        minLength="6"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium" htmlFor="register-confirm-password">
                        {text.confirmPassword} <RequiredMark text={text.requiredHint} />
                      </label>
                      <input
                        id="register-confirm-password"
                        name="confirmPassword"
                        type="password"
                        className="form-control"
                        required
                        minLength="6"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                      />
                    </div>
                  </div>

                  <h5 className="auth-section-title">{text.medicalSection}</h5>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label fw-medium" htmlFor="register-date-of-birth">
                        {text.dateOfBirth}
                      </label>
                      <input
                        id="register-date-of-birth"
                        name="dateOfBirth"
                        type="date"
                        className="form-control"
                        value={registerData.dateOfBirth}
                        onChange={handleRegisterChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-medium" htmlFor="register-gender">
                        {text.gender}
                      </label>
                      <select
                        id="register-gender"
                        name="gender"
                        className="form-select"
                        value={registerData.gender}
                        onChange={handleRegisterChange}
                      >
                        <option value="">{text.selectGender}</option>
                        <option value="male">{text.male}</option>
                        <option value="female">{text.female}</option>
                        <option value="other">{text.other}</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-medium" htmlFor="register-blood-type">
                        {text.bloodType}
                      </label>
                      <select
                        id="register-blood-type"
                        name="bloodType"
                        className="form-select"
                        value={registerData.bloodType}
                        onChange={handleRegisterChange}
                      >
                        <option value="">{text.selectBloodType}</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-medium" htmlFor="register-allergies">
                        {text.allergies} <RequiredMark text={text.requiredHint} />
                      </label>
                      <textarea
                        id="register-allergies"
                        name="allergies"
                        className="form-control"
                        rows="2"
                        required
                        placeholder={text.allergiesPlaceholder}
                        value={registerData.allergies}
                        onChange={handleRegisterChange}
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium" htmlFor="register-chronic-diseases">
                        {text.chronicDiseases} <RequiredMark text={text.requiredHint} />
                      </label>
                      <textarea
                        id="register-chronic-diseases"
                        name="chronicDiseases"
                        className="form-control"
                        rows="2"
                        required
                        placeholder={text.chronicPlaceholder}
                        value={registerData.chronicDiseases}
                        onChange={handleRegisterChange}
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium" htmlFor="register-current-medications">
                        {text.currentMedications} <RequiredMark text={text.requiredHint} />
                      </label>
                      <textarea
                        id="register-current-medications"
                        name="currentMedications"
                        className="form-control"
                        rows="2"
                        required
                        placeholder={text.medicationPlaceholder}
                        value={registerData.currentMedications}
                        onChange={handleRegisterChange}
                      ></textarea>
                    </div>
                  </div>

                  <h5 className="auth-section-title">{text.emergencySection}</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium" htmlFor="register-emergency-contact-name">
                        {text.emergencyContactName} <RequiredMark text={text.requiredHint} />
                      </label>
                      <input
                        id="register-emergency-contact-name"
                        name="emergencyContactName"
                        type="text"
                        className="form-control"
                        required
                        value={registerData.emergencyContactName}
                        onChange={handleRegisterChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium" htmlFor="register-emergency-contact-phone">
                        {text.emergencyContactPhone} <RequiredMark text={text.requiredHint} />
                      </label>
                      <input
                        id="register-emergency-contact-phone"
                        name="emergencyContactPhone"
                        type="tel"
                        className="form-control"
                        required
                        value={registerData.emergencyContactPhone}
                        onChange={handleRegisterChange}
                      />
                    </div>
                  </div>

                  <button className="btn btn-lg text-white w-100 hospital-primary-btn py-3 mt-4" type="submit">
                    {text.create}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Auth;
