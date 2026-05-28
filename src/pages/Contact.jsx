import { useState } from 'react';

const initialFormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

const contactItems = [
  {
    label: 'Hospital Address',
    value: ['1771/1 Phatthanakan Soi 37', 'Phatthanakan Road, Suan Luang Subdistrict' , 'Suan Luang District, Bangkok 10250'],
  },
  {
    label: 'General Information',
    value: ['02-763-2600'],
  },
  {
    label: 'Email',
    value: ['tniinfo@tni.ac.th'],
  },
  {
    label: 'Opening Hours',
    value: ['OPD: 08:00 AM - 08:00 PM', 'Emergency Room: Open 24 hours'],
  },
];

const contactText = {
  en: {
    emergencyLabel: 'Emergency Hotline',
    emergencyTitle: '24-Hour Emergency Call',
    emergencyDesc: 'For critical illness, accidents, or ambulance service, call emergency support immediately.',
    call: 'Call 1669',
    info: 'Contact Information',
    form: 'Send Us a Message',
    success: 'Message sent successfully. Our staff will contact you within 24 hours.',
    name: 'Full Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message Details',
    send: 'Send Message',
    map: 'Google Maps Placeholder',
    mapDesc: 'Replace this area with a Google Maps iframe when the production location is ready.',
  },
  th: {
    emergencyLabel: 'สายด่วนฉุกเฉิน',
    emergencyTitle: 'สายด่วนฉุกเฉิน 24 ชั่วโมง',
    emergencyDesc: 'กรณีผู้ป่วยวิกฤต อุบัติเหตุ หรือต้องการรถพยาบาล โทรติดต่อฉุกเฉินทันที',
    call: 'โทร 1669',
    info: 'ข้อมูลการติดต่อ',
    form: 'ส่งข้อความถึงเรา',
    success: 'ส่งข้อความสำเร็จ เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชั่วโมง',
    name: 'ชื่อ-นามสกุล',
    email: 'อีเมล',
    subject: 'หัวข้อ',
    message: 'รายละเอียดข้อความ',
    send: 'ส่งข้อความ',
    map: 'ตำแหน่งแผนที่',
    mapDesc: 'สามารถนำ iframe จาก Google Maps มาใส่ในพื้นที่นี้เมื่อพร้อมใช้งานจริง',
  },
};

function Contact({ language = 'en' }) {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const text = contactText[language];

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitted(true);
    setFormData(initialFormData);
  };

  return (
    <main className="container py-5 contact-page">
      <section className="card border-0 shadow-sm rounded-3 contact-emergency-card p-4 mb-5">
        <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <p className="contact-emergency-label mb-2">{text.emergencyLabel}</p>
            <h3 className="fw-bold mb-1">{text.emergencyTitle}</h3>
            <p className="mb-0 text-white-75">
              {text.emergencyDesc}
            </p>
          </div>
          <a href="tel:1669" className="btn btn-light btn-lg fw-bold text-danger px-4 py-3 rounded-pill shadow">
            {text.call}
          </a>
        </div>
      </section>

      <section className="row g-4">
        <div className="col-md-5">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <div className="card-body">
              <h4 className="fw-bold mb-4 text-dark-blue">{text.info}</h4>

              {contactItems.map((item) => (
                <div className="contact-info-item" key={item.label}>
                  <div className="contact-info-icon"></div>
                  <div>
                    <h6 className="fw-bold mb-1">{item.label}</h6>
                    {item.value.map((line) => (
                      <p className="text-muted mb-0 contact-info-text" key={line}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <div className="card-body">
              <h4 className="fw-bold mb-4 text-dark-blue">{text.form}</h4>

              {isSubmitted && (
                <div className="alert alert-success border-0">
                  {text.success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium" htmlFor="contact-name">{text.name}</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      className="form-control"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium" htmlFor="contact-email">{text.email}</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      className="form-control"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium" htmlFor="contact-subject">{text.subject}</label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      className="form-control"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium" htmlFor="contact-message">{text.message}</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      className="form-control"
                      rows="4"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="col-12 mt-4">
                    <button type="submit" className="btn btn-lg text-white px-4 contact-submit-btn">
                      {text.send}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="card border-0 shadow-sm rounded-3 overflow-hidden mt-5">
        <div className="contact-map-placeholder">
          <h5 className="fw-bold m-0">{text.map}</h5>
          <small className="text-muted mt-1">
            {text.mapDesc}
          </small>
        </div>
      </section>
    </main>
  );
}

export default Contact;
