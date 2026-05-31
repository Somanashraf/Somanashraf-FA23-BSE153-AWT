USE doctor_hub;

INSERT INTO roles (name, description) VALUES
('SUPER_ADMIN','Full system control'),('ADMIN','Operational administration'),('DOCTOR','Clinical user'),('ASSISTANT','Payment and appointment verifier'),('PATIENT','Healthcare customer');

-- Password for all demo accounts: Password@123
-- bcrypt hash generated for Password@123
INSERT INTO users (role_id, full_name, email, phone, password_hash) VALUES
(1,'System Owner','superadmin@doctorhub.local','03000000001','$2a$12$CN7hxvDnYF3fr4c9cSb9sObG4GkSJsjYhEr47Wv/FslfI9Qb0QWJG'),
(2,'Admin Office','admin@doctorhub.local','03000000002','$2a$12$CN7hxvDnYF3fr4c9cSb9sObG4GkSJsjYhEr47Wv/FslfI9Qb0QWJG'),
(3,'Dr. Sana Khan','sana.khan@doctorhub.local','03000000003','$2a$12$CN7hxvDnYF3fr4c9cSb9sObG4GkSJsjYhEr47Wv/FslfI9Qb0QWJG'),
(4,'Bilal Ahmed','assistant@doctorhub.local','03000000004','$2a$12$CN7hxvDnYF3fr4c9cSb9sObG4GkSJsjYhEr47Wv/FslfI9Qb0QWJG'),
(5,'Ayesha Noor','patient@doctorhub.local','03000000005','$2a$12$CN7hxvDnYF3fr4c9cSb9sObG4GkSJsjYhEr47Wv/FslfI9Qb0QWJG'),
(3,'Dr. Hammad Raza','hammad.raza@doctorhub.local','03000000006','$2a$12$CN7hxvDnYF3fr4c9cSb9sObG4GkSJsjYhEr47Wv/FslfI9Qb0QWJG');

INSERT INTO patients (user_id, gender, date_of_birth, blood_group, allergies, emergency_contact, address) VALUES
(5,'FEMALE','1999-04-12','B+','Penicillin sensitivity','03001112222','Model Town, Lahore');

INSERT INTO doctors (user_id, specialization, treatment_type, consultation_fee, experience_years, license_no, bio, rating) VALUES
(3,'Cardiology','Allopathic',2500,11,'PMC-CARD-5521','Focused on hypertension, arrhythmia, and preventive heart care.',4.90),
(6,'Respiratory Care','Homeopathic',1600,8,'HMC-RESP-7731','Chronic allergy, sinus, and asthma consultation.',4.70);

INSERT INTO assistants (user_id, assigned_doctor_id, shift_name) VALUES (4,1,'Evening OPD');

INSERT INTO diseases (name, category) VALUES
('Hypertension','Cardiology'),('Chest Pain','Cardiology'),('Arrhythmia','Cardiology'),('Asthma','Respiratory'),('Allergy','Respiratory'),('Sinus','Respiratory'),('Acne','Dermatology'),('Diabetes','Endocrinology');

INSERT INTO doctor_diseases (doctor_id, disease_id) VALUES (1,1),(1,2),(1,3),(2,4),(2,5),(2,6);

INSERT INTO clinics (doctor_id, name, city, address, phone, is_primary) VALUES
(1,'Pulse Care Clinic','Lahore','22-B Health Avenue, Gulberg','042-111-222-333',1),
(2,'LifeSpring Center','Karachi','Block 7, Clifton Medical Street','021-555-777',1);

INSERT INTO schedules (doctor_id, clinic_id, day_of_week, start_time, end_time, slot_minutes, max_patients) VALUES
(1,1,1,'17:00:00','21:00:00',20,12),(1,1,3,'17:00:00','21:00:00',20,12),(2,2,2,'14:00:00','18:00:00',20,10);

INSERT INTO appointments (patient_id, doctor_id, clinic_id, schedule_id, appointment_date, appointment_time, reason, queue_no, status) VALUES
(1,1,1,1,'2026-06-01','18:30:00','Blood pressure follow-up',1,'CONFIRMED');

INSERT INTO payments (appointment_id, amount, screenshot_path, status, verified_by, verified_at, remarks) VALUES
(1,2500,'uploads/demo-payment.png','VERIFIED',4,NOW(),'Amount and sender reference matched');

INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, diagnosis, recommendations, follow_up_date, locked) VALUES
(1,1,1,'Hypertension stage 1','Continue BP diary, reduce salt, walk 30 minutes daily','2026-06-15',1);

INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions) VALUES
(1,'Amlodipine','5mg','Once daily','14 days','Take after breakfast'),
(1,'Vitamin D3','2000 IU','Once daily','30 days','Take with meal');

INSERT INTO medical_history (patient_id, doctor_id, appointment_id, entry_type, title, description) VALUES
(1,1,1,'PRESCRIPTION','Hypertension stage 1','Prescription locked after consultation'),
(1,1,1,'FOLLOW_UP','BP diary advised','Patient must bring two-week blood pressure log');

INSERT INTO notifications (user_id, title, message, type) VALUES
(5,'Appointment confirmed','Your appointment with Dr. Sana Khan is confirmed for 2026-06-01.','APPOINTMENT'),
(3,'New patient in queue','Ayesha Noor has a confirmed appointment.','APPOINTMENT');

INSERT INTO search_logs (disease_name, city, treatment_type) VALUES
('Hypertension','Lahore','Allopathic'),('Hypertension','Lahore','Allopathic'),('Asthma','Karachi','Homeopathic'),('Diabetes','Lahore','Allopathic'),('Acne','Faisalabad','Allopathic');
