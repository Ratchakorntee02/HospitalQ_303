import { useMemo, useState } from 'react';

const departments = [
  {
    id: 'general',
    name: 'General Medicine',
    doctors: [
      {
        id: 'stone',
        name: 'Dr. Stone',
        specialty: 'General Medicine',
        profile: 'General checkups, chronic disease care, fever, blood pressure, and diabetes consultation.',
      },
      {
        id: 'sarah',
        name: 'Dr. Keerati',
        specialty: 'General Medicine',
        profile: 'Primary care, annual health checks, and follow-up consultation for adult patients.',
      },
    ],
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics',
    doctors: [
      {
        id: 'somchai',
        name: 'Dr. Pheerathad',
        specialty: 'Pediatrics',
        profile: 'Child health, vaccination, fever, allergies, and common pediatric conditions.',
      },
    ],
  },
  {
    id: 'dental',
    name: 'Dental Clinic',
    doctors: [
      {
        id: 'strang',
        name: 'Dr. Strang',
        specialty: 'Dental Clinic',
        profile: 'Dental checkups, scaling, fillings, and oral health consultation.',
      },
    ],
  },
];

const timeSlots = [
  { id: '09:00 - 10:00 AM', label: '09:00 - 10:00 AM', available: true },
  { id: '10:00 - 11:00 AM', label: '10:00 - 11:00 AM', available: true },
  { id: '01:00 - 02:00 PM', label: '01:00 - 02:00 PM', available: true },
  { id: '02:00 - 03:00 PM', label: '02:00 - 03:00 PM (Full)', available: false },
];

const bookingText = {
  en: {
    department: 'Department',
    dateTime: 'Date & Time',
    confirm: 'Confirm',
    step1: 'Step 1: Select Department and Doctor',
    departmentLabel: 'Department / Clinic',
    doctorLabel: 'Doctor',
    selectDepartment: '-- Select department --',
    selectDoctor: '-- Select doctor --',
    next: 'Next',
    back: 'Back',
    step2: 'Step 2: Select Date and Time',
    appointmentDate: 'Appointment Date',
    slots: 'Available Time Slots',
    step3: 'Step 3: Review and Confirm',
    confirmed: 'Booking Confirmed',
    saved: 'Your hospital queue booking has been saved successfully.',
    bookAnother: 'Book Another Queue',
    queueId: 'Queue ID:',
    reminder: 'Please arrive at least 15 minutes before your appointment time for check-in.',
    confirmBooking: 'Confirm Booking',
  },
  th: {
    department: 'แผนก',
    dateTime: 'วันและเวลา',
    confirm: 'ยืนยัน',
    step1: 'ขั้นตอนที่ 1: เลือกแผนกและแพทย์',
    departmentLabel: 'แผนก / คลินิก',
    doctorLabel: 'แพทย์',
    selectDepartment: '-- กรุณาเลือกแผนก --',
    selectDoctor: '-- กรุณาเลือกแพทย์ --',
    next: 'ถัดไป',
    back: 'ย้อนกลับ',
    step2: 'ขั้นตอนที่ 2: เลือกวันและเวลา',
    appointmentDate: 'วันที่นัดหมาย',
    slots: 'ช่วงเวลาที่ว่าง',
    step3: 'ขั้นตอนที่ 3: ตรวจสอบและยืนยัน',
    confirmed: 'จองคิวสำเร็จ',
    saved: 'ระบบบันทึกการจองคิวของคุณเรียบร้อยแล้ว',
    bookAnother: 'จองคิวใหม่',
    queueId: 'รหัสคิว:',
    reminder: 'กรุณามาก่อนเวลานัดหมายอย่างน้อย 15 นาที เพื่อเช็กอิน',
    confirmBooking: 'ยืนยันการจอง',
  },
};

function BookingQ({ language = 'en' }) {
  const [step, setStep] = useState(1);
  const [departmentId, setDepartmentId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const text = bookingText[language];

  const selectedDepartment = useMemo(
    () => departments.find((department) => department.id === departmentId),
    [departmentId],
  );

  const availableDoctors = useMemo(
    () => selectedDepartment?.doctors || [],
    [selectedDepartment],
  );

  const selectedDoctor = useMemo(
    () => availableDoctors.find((doctor) => doctor.id === doctorId),
    [availableDoctors, doctorId],
  );

  const canGoStepTwo = departmentId && doctorId;
  const canGoStepThree = appointmentDate && timeSlot;

  const handleDepartmentChange = (event) => {
    setDepartmentId(event.target.value);
    setDoctorId('');
  };

  const resetForm = () => {
    setStep(1);
    setDepartmentId('');
    setDoctorId('');
    setAppointmentDate('');
    setTimeSlot('');
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <main className="container py-5">
        <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mx-auto booking-card">
          <div className="card-body text-center">
            <h2 className="fw-bold text-success mb-3">{text.confirmed}</h2>
            <p className="fs-5 mb-4">{text.saved}</p>

            <div className="bg-light rounded-3 p-4 text-start mb-4">
              <p><strong>{text.department}:</strong> {selectedDepartment?.name}</p>
              <p><strong>{text.doctorLabel}:</strong> {selectedDoctor?.name}</p>
              <p><strong>{text.appointmentDate}:</strong> {appointmentDate}</p>
              <p><strong>{text.dateTime}:</strong> {timeSlot}</p>
              <p className="mb-0"><strong>{text.queueId}</strong> OPD 692202</p>
            </div>

            <button className="btn btn-primary btn-lg px-4" type="button" onClick={resetForm}>
              {text.bookAnother}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-5">
      <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
        <div className="booking-steps">
          <div className="booking-step-line"></div>

          {[1, 2, 3].map((stepNumber) => (
            <div className="booking-step" key={stepNumber}>
              <div className={`booking-step-circle ${step >= stepNumber ? 'active' : ''}`}>
                {stepNumber}
              </div>
              <small className={step >= stepNumber ? 'fw-bold text-dark' : 'text-muted'}>
                {stepNumber === 1 && text.department}
                {stepNumber === 2 && text.dateTime}
                {stepNumber === 3 && text.confirm}
              </small>
            </div>
          ))}
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mx-auto booking-card">
        <div className="card-body">
          {step === 1 && (
            <>
              <h3 className="fw-bold mb-4 text-dark-blue">{text.step1}</h3>

              <div className="mb-3">
                <label className="form-label fw-medium">{text.departmentLabel}</label>
                <select
                  className="form-select form-select-lg"
                  value={departmentId}
                  onChange={handleDepartmentChange}
                >
                  <option value="">{text.selectDepartment}</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium">{text.doctorLabel}</label>
                <select
                  className="form-select form-select-lg"
                  value={doctorId}
                  onChange={(event) => setDoctorId(event.target.value)}
                  disabled={!departmentId}
                >
                  <option value="">{text.selectDoctor}</option>
                  {availableDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDoctor && (
                <div className="doctor-preview mb-4">
                  <div className="doctor-avatar">{selectedDoctor.name.charAt(0)}</div>
                  <div>
                    <h5 className="fw-bold mb-1">{selectedDoctor.name}</h5>
                    <p className="text-muted mb-1">{selectedDoctor.specialty}</p>
                    <p className="mb-0">{selectedDoctor.profile}</p>
                  </div>
                </div>
              )}

              <button
                className="btn btn-lg text-white w-100 py-3 hospital-primary-btn"
                type="button"
                disabled={!canGoStepTwo}
                onClick={() => setStep(2)}
              >
                {text.next}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="fw-bold mb-4 text-dark-blue">{text.step2}</h3>

              <div className="mb-3">
                <label className="form-label fw-medium">{text.appointmentDate}</label>
                <input
                  type="date"
                  className="form-control form-control-lg"
                  value={appointmentDate}
                  onChange={(event) => setAppointmentDate(event.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium d-block mb-2">{text.slots}</label>
                <div className="row g-2">
                  {timeSlots.map((slot) => (
                    <div className="col-6" key={slot.id}>
                      <button
                        className={`btn w-100 py-2 ${
                          timeSlot === slot.id ? 'btn-primary' : 'btn-outline-primary'
                        }`}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setTimeSlot(slot.id)}
                      >
                        {slot.label}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-lg btn-light border w-50 py-3" type="button" onClick={() => setStep(1)}>
                  {text.back}
                </button>
                <button
                  className="btn btn-lg text-white w-50 py-3 hospital-primary-btn"
                  type="button"
                  disabled={!canGoStepThree}
                  onClick={() => setStep(3)}
                >
                  {text.next}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center">
              <h3 className="fw-bold mb-4 text-dark-blue">{text.step3}</h3>

              <div className="bg-light p-4 rounded-3 text-start mb-4 fs-5">
                <p><strong>{text.department}:</strong> {selectedDepartment?.name}</p>
                <p><strong>{text.doctorLabel}:</strong> {selectedDoctor?.name}</p>
                <p><strong>{text.appointmentDate}:</strong> {appointmentDate}</p>
                <p><strong>{text.dateTime}:</strong> {timeSlot}</p>
              </div>

              <div className="alert alert-info py-2">
                {text.reminder}
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-lg btn-light border w-50 py-3" type="button" onClick={() => setStep(2)}>
                  {text.back}
                </button>
                <button className="btn btn-lg btn-success w-50 py-3" type="button" onClick={() => setIsSubmitted(true)}>
                  {text.confirmBooking}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default BookingQ;
