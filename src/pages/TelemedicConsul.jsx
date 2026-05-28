import { useState } from 'react';
import bj from '../assets/blackjack.jpg';
import st from '../assets/drstrange.jpg';
import sc from '../assets/drstone.jpg';

const onlineDoctors = [
  {
    id: 'blackjack',
    name: 'Dr. Black Jack',
    expert: 'General Medicine',
    status: 'Available Now',
    eta: 'Estimated wait: 2 minutes',
    img: bj,
  },
  {
    id: 'strange',
    name: 'Dr. Strange',
    expert: 'Pediatrics',
    status: 'Available Now',
    eta: 'Ready to connect',
    img: st,
  },
  {
    id: 'stone',
    name: 'Dr. Stone',
    expert: 'Follow-up Consultation',
    status: 'Available Soon',
    eta: 'Estimated wait: 8 minutes',
    img: sc,
  },
];

const telemedText = {
  en: {
    eyebrow: 'Online Consultation',
    title: 'Talk to a Doctor From Home',
    subtitle: 'Get quick medical advice, follow-up care, and basic prescriptions without traveling to the hospital.',
    stable: 'Stable Online System',
    listTitle: 'Doctors Available for Video Call',
    listSubtitle: 'Choose an online doctor and start a virtual room instantly.',
    onlineNow: 'online now',
    schedule: 'View Schedule',
    call: 'Start Video Call',
    connecting: 'Connecting...',
    noteLabel: 'Helpful note:',
    note: (name) => `Connecting to ${name}. A virtual consultation room will open in the next step.`,
    advice: 'Telemedicine is suitable for stable, non-emergency symptoms such as colds, rashes, headaches, follow-up questions, or blood test consultation. For emergency symptoms, please contact the hospital emergency line immediately.',
  },
  th: {
    eyebrow: 'ปรึกษาแพทย์ออนไลน์',
    title: 'พบแพทย์ออนไลน์จากที่บ้าน',
    subtitle: 'รับคำแนะนำเบื้องต้น ติดตามอาการ และปรึกษาเรื่องยา โดยไม่ต้องเดินทางมาโรงพยาบาล',
    stable: 'ระบบออนไลน์เสถียร',
    listTitle: 'แพทย์ที่พร้อมวิดีโอคอล',
    listSubtitle: 'เลือกแพทย์ออนไลน์และเริ่มห้องตรวจเสมือนได้ทันที',
    onlineNow: 'ท่านออนไลน์อยู่',
    schedule: 'ดูตารางเวลา',
    call: 'เริ่มวิดีโอคอล',
    connecting: 'กำลังเชื่อมต่อ...',
    noteLabel: 'คำแนะนำ:',
    note: (name) => `กำลังเชื่อมต่อกับ ${name} ขั้นตอนถัดไปจะเปิดห้องตรวจออนไลน์`,
    advice: 'บริการปรึกษาแพทย์ออนไลน์เหมาะกับอาการไม่ฉุกเฉิน เช่น ไข้หวัด ผื่น ปวดหัว คำถามติดตามอาการ หรือปรึกษาผลเลือด หากมีอาการฉุกเฉิน กรุณาติดต่อสายด่วนโรงพยาบาลทันที',
  },
};

function TelemedicConsul({ language = 'en' }) {
  const [connectingDoctor, setConnectingDoctor] = useState(null);
  const text = telemedText[language];

  const handleStartCall = (doctor) => {
    setConnectingDoctor(doctor);
  };

  return (
    <main className="container py-5 telemed-page">
      <section className="telemed-hero shadow-sm mb-5">
        <div>
          <p className="telemed-eyebrow mb-2">{text.eyebrow}</p>
          <h2 className="fw-bold mb-2">{text.title}</h2>
          <p className="mb-0 text-white-75">
            {text.subtitle}
          </p>
        </div>
        <span className="telemed-system-badge">{text.stable}</span>
      </section>

      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center mb-4">
        <div>
          <h4 className="fw-bold text-dark-blue mb-1">{text.listTitle}</h4>
          <p className="text-muted mb-0">{text.listSubtitle}</p>
        </div>
        <span className="telemed-online-summary">
          {onlineDoctors.filter((doctor) => doctor.status === 'Available Now').length} {text.onlineNow}
        </span>
      </div>

      <section className="row g-4">
        {onlineDoctors.map((doctor) => {
          const isAvailableNow = doctor.status === 'Available Now';
          const isConnecting = connectingDoctor?.id === doctor.id;

          return (
            <div className="col-12" key={doctor.id}>
              <article className="card border-0 shadow-sm rounded-3 p-3 bg-white telemed-doctor-card">
                <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-4 flex-wrap">
                    <img
                      src={doctor.img}
                      alt={doctor.name}
                      className="rounded-circle bg-light shadow-sm telemed-doctor-photo"
                    />
                    <div>
                      <h5 className="fw-bold mb-1 text-dark">{doctor.name}</h5>
                      <p className="text-primary mb-2 fw-medium telemed-specialty">{doctor.expert}</p>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className={`telemed-status-dot ${isAvailableNow ? 'active' : ''}`}></span>
                        <small className={isAvailableNow ? 'text-success fw-bold' : 'text-warning fw-bold'}>
                          {doctor.status}
                        </small>
                        <small className="text-muted">{doctor.eta}</small>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 flex-wrap telemed-actions">
                    <button className="btn btn-outline-secondary px-3 py-2 rounded-3" type="button">
                      {text.schedule}
                    </button>
                    <button
                      className="btn text-white px-4 py-2 rounded-3 fw-bold shadow-sm telemed-call-btn"
                      type="button"
                      disabled={!isAvailableNow}
                      onClick={() => handleStartCall(doctor)}
                    >
                      {isConnecting ? text.connecting : text.call}
                    </button>
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </section>

      {connectingDoctor && (
        <section className="alert alert-info border-0 shadow-sm mt-4 telemed-connecting-note">
          {text.note(connectingDoctor.name)}
        </section>
      )}

      <section className="card border-0 rounded-3 bg-light mt-5 p-3 text-muted telemed-advice">
        <strong>{text.noteLabel}</strong> {text.advice}
      </section>
    </main>
  );
}

export default TelemedicConsul;
