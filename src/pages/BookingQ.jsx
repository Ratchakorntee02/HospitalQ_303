import { useMemo, useState } from 'react';
import { api, getAuthSession } from '../services/api.js';

const departments = [
  {
    id: 'general',
    name: 'General Medicine',
    doctors: [
      {
        id: 'D001',
        name: 'Dr. Stone',
        specialty: 'General Medicine',
        profile: 'General checkups, chronic disease care, fever, blood pressure, and diabetes consultation.',
      },
      {
        id: 'D003',
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
        id: 'D003',
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
        id: 'D002',
        name: 'Dr. Strang',
        specialty: 'Dental Clinic',
        profile: 'Dental checkups, scaling, fillings, and oral health consultation.',
      },
    ],
  },
];

const timeSlots = [
  { id: '09:00:00', label: '09:00 - 10:00 AM', available: true },
  { id: '10:00:00', label: '10:00 - 11:00 AM', available: true },
  { id: '13:00:00', label: '01:00 - 02:00 PM', available: true },
  { id: '14:00:00', label: '02:00 - 03:00 PM (Full)', available: false },
];

const demoBookedSlotsByDoctor = {
  D001: ['10:00:00'],
  D002: ['13:00:00'],
  D003: ['09:00:00'],
};

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
    slotBooked: 'Already booked',
    slotFull: 'Full',
    availabilityNotice: 'The system checks available slots before booking. Unavailable times are locked for selection.',
    noteLabel: 'Current Symptoms',
    notePlaceholder: 'Describe current symptoms, concerns, or special requests for this visit.',
    noteEmpty: 'No additional note',
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
    slotBooked: 'ไม่ว่าง',
    slotFull: 'เต็ม',
    availabilityNotice: 'ระบบตรวจสอบช่วงเวลาว่างก่อนจอง ช่วงเวลาที่ไม่ว่างจะเลือกไม่ได้',
    noteLabel: 'Current Symptoms',
    notePlaceholder: 'ระบุอาการที่เป็นอยู่ ความกังวล หรือคำขอเพิ่มเติมสำหรับการเข้ารับบริการครั้งนี้',
    noteEmpty: 'ไม่มีหมายเหตุเพิ่มเติม',
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
  const [bookingNote, setBookingNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [submitError, setSubmitError] = useState('');
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
  const noteDisplay = bookingNote.trim() || text.noteEmpty;
  const checkedTimeSlots = useMemo(() => {
    const bookedTimes = appointmentDate ? demoBookedSlotsByDoctor[doctorId] || [] : [];

    return timeSlots.map((slot) => {
      const isBooked = bookedTimes.includes(slot.id);

      return {
        ...slot,
        isBooked,
        available: slot.available && !isBooked,
      };
    });
  }, [appointmentDate, doctorId]);
  const selectedTimeSlotLabel = checkedTimeSlots.find((slot) => slot.id === timeSlot)?.label || timeSlot;

  const handleDepartmentChange = (event) => {
    setDepartmentId(event.target.value);
    setDoctorId('');
    setTimeSlot('');
  };

  const handleDoctorChange = (event) => {
    setDoctorId(event.target.value);
    setTimeSlot('');
  };

  const handleAppointmentDateChange = (event) => {
    setAppointmentDate(event.target.value);
    setTimeSlot('');
  };

  const resetForm = () => {
    setStep(1);
    setDepartmentId('');
    setDoctorId('');
    setAppointmentDate('');
    setTimeSlot('');
    setBookingNote('');
    setIsSubmitted(false);
    setBookingId('');
    setSubmitError('');
  };

  const handleConfirmBooking = async () => {
    const authSession = getAuthSession();

    if (!authSession?.token || !authSession?.user?.id) {
      setSubmitError('Please login before booking an appointment.');
      return;
    }

    try {
      setSubmitError('');
      const result = await api.bookAppointment({
        patient_id: authSession.user.id,
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        appointment_time: timeSlot,
        current_symptoms: bookingNote,
      });

      setBookingId(result.appointment_id || '');
      setIsSubmitted(true);
    } catch (apiError) {
      setSubmitError(apiError.message);
    }
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
              <p><strong>{text.dateTime}:</strong> {selectedTimeSlotLabel}</p>
              <p><strong>{text.noteLabel}:</strong> {noteDisplay}</p>
              <p className="mb-0"><strong>{text.queueId}</strong> {bookingId || 'OPD 692202'}</p>
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
                  onChange={handleDoctorChange}
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
                  onChange={handleAppointmentDateChange}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium d-block mb-2">{text.slots}</label>
                {appointmentDate && (
                  <div className="alert alert-info border-0 py-2 small">
                    {text.availabilityNotice}
                  </div>
                )}
                <div className="row g-2">
                  {checkedTimeSlots.map((slot) => (
                    <div className="col-6" key={slot.id}>
                      <button
                        className={`btn w-100 py-2 ${
                          slot.available
                            ? timeSlot === slot.id ? 'btn-primary' : 'btn-outline-primary'
                            : 'btn-outline-secondary'
                        }`}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setTimeSlot(slot.id)}
                      >
                        {slot.label}
                        {!slot.available && (
                          <span className="d-block small">
                            {slot.isBooked ? text.slotBooked : text.slotFull}
                          </span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium" htmlFor="booking-note">
                  {text.noteLabel}
                </label>
                <textarea
                  id="booking-note"
                  className="form-control"
                  rows="3"
                  placeholder={text.notePlaceholder}
                  value={bookingNote}
                  onChange={(event) => setBookingNote(event.target.value)}
                ></textarea>
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
                <p><strong>{text.dateTime}:</strong> {selectedTimeSlotLabel}</p>
                <p><strong>{text.noteLabel}:</strong> {noteDisplay}</p>
              </div>

              <div className="alert alert-info py-2">
                {text.reminder}
              </div>

              {submitError && (
                <div className="alert alert-danger py-2">
                  {submitError}
                </div>
              )}

              <div className="d-flex gap-2">
                <button className="btn btn-lg btn-light border w-50 py-3" type="button" onClick={() => setStep(2)}>
                  {text.back}
                </button>
                <button className="btn btn-lg btn-success w-50 py-3" type="button" onClick={handleConfirmBooking}>
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
