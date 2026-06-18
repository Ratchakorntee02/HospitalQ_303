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

CREATE TABLE IF NOT EXISTS Admins (
  admin_id varchar(50) NOT NULL,
  name varchar(100) NOT NULL,
  email varchar(100) NOT NULL,
  password varchar(255) NOT NULL,
  PRIMARY KEY (admin_id),
  UNIQUE KEY unique_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO Admins (admin_id, name, email, password) VALUES
('ADM001', 'Hospital Admin', 'admin@hospital.com', 'password123');
