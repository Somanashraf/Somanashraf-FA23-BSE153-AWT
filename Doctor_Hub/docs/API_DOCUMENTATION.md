# Doctor Hub API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### Register Patient
`POST /auth/register`

```json
{
  "fullName": "Ayesha Noor",
  "email": "ayesha@example.com",
  "phone": "03001234567",
  "password": "Password@123",
  "role": "PATIENT"
}
```

### Login
`POST /auth/login`

Returns access token, refresh token, and user role.

### Refresh Token
`POST /auth/refresh`

```json
{ "refreshToken": "token" }
```

## Doctors

### Search Doctors
`GET /doctors?disease=Hypertension&treatmentType=Allopathic&city=Lahore&minFee=1000&maxFee=3000`

Filters by disease, specialization, treatment type, city, and fee range.

### Doctor Clinics
`GET /doctors/:doctorId/clinics`

### Doctor Schedules
`GET /doctors/:doctorId/schedules`

## Appointments

### Book Appointment
`POST /appointments`

```json
{
  "patientId": 1,
  "doctorId": 1,
  "clinicId": 1,
  "scheduleId": 1,
  "date": "2026-06-01",
  "time": "18:30",
  "reason": "Blood pressure follow-up"
}
```

### Upload Payment Screenshot
`POST /appointments/:id/payment`

Multipart fields: `screenshot`, `amount`.

### Verify Payment
`PATCH /appointments/payments/:paymentId/verify`

Roles: Assistant, Admin, Super Admin.

```json
{ "status": "VERIFIED", "remarks": "Amount matched" }
```

### Update Appointment Status
`PATCH /appointments/:id/status`

```json
{ "status": "IN_PROGRESS" }
```

## Medical History

### Patient History
`GET /medical/patients/:patientId/history`

History is append-only. Delete is blocked at database trigger level.

### Upload Lab Report
`POST /medical/patients/:patientId/lab-reports`

Multipart fields: `report`, `title`.

## Prescriptions

### Create Prescription
`POST /medical/prescriptions`

Role: Doctor. Existing prescription for an appointment cannot be modified.

```json
{
  "appointmentId": 1,
  "patientId": 1,
  "diagnosis": "Hypertension stage 1",
  "recommendations": "Reduce salt and maintain BP diary",
  "followUpDate": "2026-06-15",
  "items": [
    { "medicineName": "Amlodipine", "dosage": "5mg", "frequency": "Once daily", "duration": "14 days", "instructions": "After breakfast" }
  ]
}
```

### Download Prescription PDF
`GET /medical/prescriptions/:prescriptionId/download`

## Admin Analytics

### Dashboard Analytics
`GET /admin/analytics`

Returns daily appointments, monthly appointments, revenue charts, most searched diseases, and doctor performance.

## Custom Exceptions

- `InvalidAccountException`
- `AppointmentNotFoundException`
- `PaymentVerificationException`
- `UnauthorizedAccessException`
- `PrescriptionLockedException`
