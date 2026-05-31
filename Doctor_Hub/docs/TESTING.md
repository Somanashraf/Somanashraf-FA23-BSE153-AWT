# Testing Documentation

## White Box Testing

| Area | Internal Path Tested | Expected Result |
| --- | --- | --- |
| JWT auth | `auth.service.login` validates bcrypt hash and account status | Invalid users receive `InvalidAccountException` |
| RBAC | `authorize(...roles)` checks role from token payload | Protected routes reject unauthorized roles |
| Appointment status | `appointment.service.updateStatus` verifies appointment exists before update | Unknown ID throws `AppointmentNotFoundException` |
| Prescription lock | `medical.service.createPrescription` checks existing appointment prescription | Duplicate prescription throws `PrescriptionLockedException` |
| History integrity | DB trigger `prevent_history_delete` | Delete attempts fail |

## Unit Tests

Run backend tests:

```bash
cd backend
npm test
```

Included starter test: `tests/health.test.js` verifies API availability.

Recommended additional unit tests:

- Login success/failure cases
- Refresh token expiry
- Doctor search filters
- Payment verification state changes
- Prescription duplicate protection

## API Testing

Use Postman or Thunder Client collection structure:

1. Auth: register, login, refresh
2. Doctors: search by disease, treatment type, city, fee
3. Appointments: create, list, update status
4. Payments: upload screenshot, verify/reject
5. Medical: upload lab report, view history
6. Prescriptions: create, download PDF
7. Admin: analytics, users

## Validation Testing

- Weak passwords must fail registration.
- Empty diagnosis must fail prescription creation.
- Invalid appointment date must fail booking.
- Unsupported upload types must be rejected.
- Non-doctor users cannot create prescriptions.

## Security Testing

- Missing JWT returns unauthorized response.
- Patient cannot access assistant payment verification.
- Previous prescriptions cannot be updated or deleted.
- Medical history cannot be deleted.
- File uploads are limited to 5 MB and images/PDF only.
