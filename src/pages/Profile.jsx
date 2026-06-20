import { useEffect, useMemo, useState } from 'react';
import { api, getAuthSession, saveAuthSession } from '../services/api.js';

const profileText = {
  en: {
    title: 'Personal Information',
    subtitle: 'View and update your account information.',
    patientSubtitle: 'Patients can manage contact details and basic health information for doctor review.',
    doctorSubtitle: 'Doctors can manage profile details used in appointment booking and dashboard screens.',
    loginRequired: 'Please login before opening your profile.',
    loading: 'Loading profile...',
    saved: 'Profile updated successfully.',
    accountInfo: 'Account Information',
    healthInfo: 'Basic Health Information for Doctor',
    securityInfo: 'Security',
    name: 'Full Name',
    phone: 'Phone Number',
    citizenId: 'Citizen ID',
    email: 'Email',
    password: 'New Password',
    passwordHelp: 'Leave blank if you do not want to change your password.',
    birthDate: 'Date of Birth',
    gender: 'Gender',
    bloodType: 'Blood Type',
    allergies: 'Allergies',
    chronicDiseases: 'Chronic Diseases',
    currentMedications: 'Current Medications',
    emergencyContactName: 'Emergency Contact Name',
    emergencyContactPhone: 'Emergency Contact Phone',
    department: 'Department',
    save: 'Save Changes',
    requiredHint: 'Required. Enter "-" if there is no information available.',
  },
  th: {
    title: 'ข้อมูลส่วนตัว',
    subtitle: 'ดูและแก้ไขข้อมูลบัญชีของคุณ',
    patientSubtitle: 'ผู้ป่วยสามารถจัดการข้อมูลติดต่อและข้อมูลสุขภาพเบื้องต้นสำหรับให้แพทย์ดูได้',
    doctorSubtitle: 'แพทย์สามารถจัดการข้อมูลโปรไฟล์ที่ใช้ในหน้าจองคิวและ Doctor Dashboard ได้',
    loginRequired: 'กรุณาเข้าสู่ระบบก่อนเปิดข้อมูลส่วนตัว',
    loading: 'กำลังโหลดข้อมูลส่วนตัว...',
    saved: 'บันทึกข้อมูลส่วนตัวสำเร็จ',
    accountInfo: 'ข้อมูลบัญชี',
    healthInfo: 'ข้อมูลสุขภาพเบื้องต้นสำหรับแพทย์',
    securityInfo: 'ความปลอดภัย',
    name: 'ชื่อ-นามสกุล',
    phone: 'เบอร์โทรศัพท์',
    citizenId: 'เลขบัตรประชาชน',
    email: 'อีเมล',
    password: 'รหัสผ่านใหม่',
    passwordHelp: 'เว้นว่างไว้ หากไม่ต้องการเปลี่ยนรหัสผ่าน',
    birthDate: 'วันเกิด',
    gender: 'เพศ',
    bloodType: 'หมู่เลือด',
    allergies: 'แพ้ยา',
    chronicDiseases: 'โรคประจำตัว',
    currentMedications: 'ยาที่ใช้อยู่',
    emergencyContactName: 'ผู้ติดต่อฉุกเฉิน',
    emergencyContactPhone: 'เบอร์ผู้ติดต่อฉุกเฉิน',
    department: 'แผนก',
    save: 'บันทึกการเปลี่ยนแปลง',
    requiredHint: 'จำเป็นต้องกรอก หากไม่มีข้อมูลให้ใส่ "-"',
  },
};

const emptyPatientForm = {
  name: '',
  phone: '',
  citizen_id: '',
  email: '',
  password: '',
  birth_date: '',
  gender: '',
  blood_type: '',
  allergies: '',
  chronic_diseases: '',
  current_medications: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
};

const emptyDoctorForm = {
  name: '',
  department: '',
  email: '',
  password: '',
};

const formatDateInput = (dateValue) => {
  if (!dateValue) return '';
  return String(dateValue).slice(0, 10);
};

function Profile({ language = 'en', onProfileUpdated }) {
  const text = profileText[language];
  const authSession = getAuthSession();
  const authToken = authSession?.token;
  const [role, setRole] = useState(authSession?.role || '');
  const [form, setForm] = useState(authSession?.role === 'doctor' ? emptyDoctorForm : emptyPatientForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isDoctor = role === 'doctor';
  const headingSubtitle = isDoctor ? text.doctorSubtitle : text.patientSubtitle;

  const requiredPatientLabels = useMemo(() => [
    text.bloodType,
    text.allergies,
    text.chronicDiseases,
    text.currentMedications,
    text.emergencyContactName,
    text.emergencyContactPhone,
  ], [text]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!authToken) return;

      try {
        setLoading(true);
        setError('');
        const result = await api.getProfile();
        setRole(result.role);
        if (result.role === 'doctor') {
          setForm({ ...emptyDoctorForm, ...result.profile, password: '' });
        } else {
          setForm({ ...emptyPatientForm, ...result.profile, birth_date: formatDateInput(result.profile.birth_date), password: '' });
        }
      } catch (apiError) {
        setError(apiError.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [authToken]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMessage('');
    setError('');
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setMessage('');
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const result = await api.updateProfile(payload);
      const updatedProfile = result.profile;

      if (authSession) {
        const nextSession = {
          ...authSession,
          user: {
            ...authSession.user,
            name: updatedProfile.name,
            email: updatedProfile.email,
          },
        };
        saveAuthSession(nextSession);
        onProfileUpdated?.(nextSession);
      }

      if (result.role === 'doctor') {
        setForm({ ...emptyDoctorForm, ...updatedProfile, password: '' });
      } else {
        setForm({ ...emptyPatientForm, ...updatedProfile, birth_date: formatDateInput(updatedProfile.birth_date), password: '' });
      }
      setMessage(text.saved);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSaving(false);
    }
  };

  if (!authSession?.token) {
    return (
      <main className="container py-5">
        <div className="alert alert-warning border-0 shadow-sm">{text.loginRequired}</div>
      </main>
    );
  }

  return (
    <main className="container py-5 profile-page">
      <section className="mb-4">
        <h2 className="fw-bold text-dark-blue mb-2">{text.title}</h2>
        <p className="text-muted mb-1">{text.subtitle}</p>
        <p className="text-muted mb-0">{headingSubtitle}</p>
      </section>

      {loading && <div className="alert alert-info border-0 shadow-sm">{text.loading}</div>}
      {message && <div className="alert alert-success border-0 shadow-sm">{message}</div>}
      {error && <div className="alert alert-danger border-0 shadow-sm">{error}</div>}

      <form className="card border-0 shadow-sm rounded-3 p-4 bg-white" onSubmit={handleSubmit}>
        <h5 className="fw-bold text-dark-blue mb-3">{text.accountInfo}</h5>

        {isDoctor ? (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">{text.name}</label>
              <input className="form-control" name="name" value={form.name || ''} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">{text.department}</label>
              <input className="form-control" name="department" value={form.department || ''} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">{text.email}</label>
              <input className="form-control" name="email" type="email" value={form.email || ''} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">{text.password}</label>
              <input className="form-control" name="password" type="password" value={form.password || ''} onChange={handleChange} minLength="8" />
              <div className="form-text">{text.passwordHelp}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">{text.name}</label>
                <input className="form-control" name="name" value={form.name || ''} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">{text.phone}</label>
                <input className="form-control" name="phone" value={form.phone || ''} onChange={handleChange} pattern="^0[0-9]{9}$" required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">{text.citizenId}</label>
                <input className="form-control" name="citizen_id" value={form.citizen_id || ''} onChange={handleChange} pattern="^[0-9]{13}$" required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">{text.email}</label>
                <input className="form-control" name="email" type="email" value={form.email || ''} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">{text.birthDate}</label>
                <input className="form-control" name="birth_date" type="date" value={form.birth_date || ''} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">{text.gender}</label>
                <input className="form-control" name="gender" value={form.gender || ''} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">{text.password}</label>
                <input className="form-control" name="password" type="password" value={form.password || ''} onChange={handleChange} minLength="8" />
                <div className="form-text">{text.passwordHelp}</div>
              </div>
            </div>

            <hr className="my-4" />
            <h5 className="fw-bold text-dark-blue mb-2">{text.healthInfo}</h5>
            <p className="text-muted small mb-3">{text.requiredHint}: {requiredPatientLabels.join(', ')}</p>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">{text.bloodType}</label>
                <input className="form-control" name="blood_type" value={form.blood_type || ''} onChange={handleChange} required />
              </div>
              <div className="col-md-8">
                <label className="form-label fw-semibold">{text.allergies}</label>
                <input className="form-control" name="allergies" value={form.allergies || ''} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">{text.chronicDiseases}</label>
                <input className="form-control" name="chronic_diseases" value={form.chronic_diseases || ''} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">{text.currentMedications}</label>
                <input className="form-control" name="current_medications" value={form.current_medications || ''} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">{text.emergencyContactName}</label>
                <input className="form-control" name="emergency_contact_name" value={form.emergency_contact_name || ''} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">{text.emergencyContactPhone}</label>
                <input className="form-control" name="emergency_contact_phone" value={form.emergency_contact_phone || ''} onChange={handleChange} required />
              </div>
            </div>
          </>
        )}

        <div className="text-end mt-4">
          <button className="btn btn-primary px-4" type="submit" disabled={saving}>
            {saving ? 'Saving...' : text.save}
          </button>
        </div>
      </form>
    </main>
  );
}

export default Profile;
