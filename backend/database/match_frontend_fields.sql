USE hospital_queue_db;

ALTER TABLE Patients
  MODIFY birth_date date DEFAULT NULL;

ALTER TABLE Patients
  ADD COLUMN IF NOT EXISTS gender varchar(30) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS blood_type varchar(5) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS allergies text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS chronic_diseases text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS current_medications text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS emergency_contact_name varchar(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone varchar(20) DEFAULT NULL;

ALTER TABLE Appointments
  ADD COLUMN IF NOT EXISTS current_symptoms text DEFAULT NULL;

ALTER TABLE Appointments
  MODIFY status varchar(50) NOT NULL DEFAULT 'confirmed';

UPDATE Appointments
SET status = 'confirmed'
WHERE status NOT IN ('confirmed', 'completed', 'cancelled');
