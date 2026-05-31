CREATE DATABASE IF NOT EXISTS doctor_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE doctor_hub;

CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(40) NOT NULL UNIQUE,
  description VARCHAR(160),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE','INACTIVE','SUSPENDED') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE patients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  gender ENUM('MALE','FEMALE','OTHER'),
  date_of_birth DATE,
  blood_group VARCHAR(5),
  allergies TEXT,
  emergency_contact VARCHAR(80),
  address TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  specialization VARCHAR(120) NOT NULL,
  treatment_type ENUM('Allopathic','Homeopathic','Herbal') NOT NULL,
  consultation_fee DECIMAL(10,2) NOT NULL,
  experience_years INT DEFAULT 0,
  license_no VARCHAR(80) NOT NULL UNIQUE,
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE assistants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  assigned_doctor_id INT,
  shift_name VARCHAR(60),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_doctor_id) REFERENCES doctors(id)
);

CREATE TABLE diseases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL UNIQUE,
  category VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctor_diseases (
  doctor_id INT NOT NULL,
  disease_id INT NOT NULL,
  PRIMARY KEY (doctor_id, disease_id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (disease_id) REFERENCES diseases(id)
);

CREATE TABLE clinics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  doctor_id INT NOT NULL,
  name VARCHAR(140) NOT NULL,
  city VARCHAR(80) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(30),
  is_primary BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  doctor_id INT NOT NULL,
  clinic_id INT NOT NULL,
  day_of_week TINYINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_minutes INT DEFAULT 20,
  max_patients INT DEFAULT 20,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  INDEX idx_schedule_doctor_day (doctor_id, day_of_week)
);

CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  clinic_id INT NOT NULL,
  schedule_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT,
  queue_no INT NOT NULL,
  status ENUM('PENDING_PAYMENT','PAYMENT_UNDER_REVIEW','CONFIRMED','REJECTED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'PENDING_PAYMENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (clinic_id) REFERENCES clinics(id),
  FOREIGN KEY (schedule_id) REFERENCES schedules(id),
  UNIQUE KEY uq_doctor_slot (doctor_id, appointment_date, appointment_time),
  INDEX idx_appointments_status_date (status, appointment_date)
);

CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  screenshot_path VARCHAR(255) NOT NULL,
  status ENUM('PENDING','VERIFIED','REJECTED') DEFAULT 'PENDING',
  verified_by INT,
  verified_at DATETIME,
  remarks VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  FOREIGN KEY (verified_by) REFERENCES users(id)
);

CREATE TABLE prescriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL UNIQUE,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  diagnosis TEXT NOT NULL,
  recommendations TEXT,
  follow_up_date DATE,
  locked BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE prescription_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  prescription_id INT NOT NULL,
  medicine_name VARCHAR(160) NOT NULL,
  dosage VARCHAR(80),
  frequency VARCHAR(80),
  duration VARCHAR(80),
  instructions TEXT,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id)
);

CREATE TABLE medical_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT,
  appointment_id INT,
  entry_type ENUM('DIAGNOSIS','PRESCRIPTION','LAB_REPORT','FOLLOW_UP','PAYMENT','SYSTEM_NOTE') NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  attachment_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id),
  FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  INDEX idx_history_patient_date (patient_id, created_at)
);

CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('APPOINTMENT','PAYMENT','PRESCRIPTION','SYSTEM') DEFAULT 'SYSTEM',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  actor_user_id INT,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id INT,
  metadata JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_user_id) REFERENCES users(id),
  INDEX idx_audit_entity (entity_type, entity_id)
);

CREATE TABLE search_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  disease_name VARCHAR(120),
  city VARCHAR(80),
  treatment_type VARCHAR(40),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_search_disease (disease_name)
);

DELIMITER //
CREATE TRIGGER prevent_prescription_update BEFORE UPDATE ON prescriptions
FOR EACH ROW
BEGIN
  IF OLD.locked = TRUE THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PrescriptionLockedException: previous prescriptions are immutable';
  END IF;
END//

CREATE TRIGGER prevent_prescription_delete BEFORE DELETE ON prescriptions
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PrescriptionLockedException: prescriptions cannot be deleted';
END//

CREATE TRIGGER prevent_history_delete BEFORE DELETE ON medical_history
FOR EACH ROW
BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Medical history can never be deleted';
END//
DELIMITER ;
