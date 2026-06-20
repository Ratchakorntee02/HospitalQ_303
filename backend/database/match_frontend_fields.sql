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
SET status = CASE
  WHEN status IN ('ยืนยันแล้ว', 'waiting', 'active') THEN 'confirmed'
  WHEN status IN ('ยกเลิก', 'cancel') THEN 'cancelled'
  WHEN status IN ('เสร็จสิ้น', 'done', 'finished') THEN 'completed'
  ELSE status
END
WHERE status NOT IN ('confirmed', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS Schedules (
  schedule_id varchar(50) NOT NULL,
  doctor_id varchar(50) NOT NULL,
  available_date date NOT NULL,
  available_time time NOT NULL,
  max_queue int NOT NULL DEFAULT 3,
  PRIMARY KEY (schedule_id),
  KEY idx_schedules_doctor_date_time (doctor_id, available_date, available_time),
  CONSTRAINT schedules_doctor_fk FOREIGN KEY (doctor_id) REFERENCES Doctors (doctor_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS Notifications (
  notification_id varchar(50) NOT NULL,
  doctor_id varchar(50) NOT NULL,
  appointment_id varchar(50) NOT NULL,
  message text NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'unread',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  KEY idx_notifications_doctor_status (doctor_id, status),
  KEY idx_notifications_appointment (appointment_id),
  CONSTRAINT notifications_doctor_fk FOREIGN KEY (doctor_id) REFERENCES Doctors (doctor_id) ON DELETE CASCADE,
  CONSTRAINT notifications_appointment_fk FOREIGN KEY (appointment_id) REFERENCES Appointments (appointment_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS Admins;
