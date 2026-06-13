# 🏥 Doctor Hub — Enterprise Healthcare Platform

A production-ready, enterprise-grade healthcare consultation and patient history management platform built with the **MERN Stack**.

---

## 🚀 Live Demo
- **Frontend**: Deploy on [Vercel](https://vercel.com)
- **Backend**: Deploy on [Render](https://render.com)
- **Database**: [MongoDB Atlas](https://cloud.mongodb.com)

---

## 📁 Project Structure

```
THE_DOCTOR_HUB/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/             # DB, Cloudinary config
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Auth, error, rate limiter
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express routers
│   │   ├── services/           # (email etc.)
│   │   ├── utils/              # JWT, logger, response helpers
│   │   └── server.js           # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/                   # React + Vite SPA
    ├── src/
    │   ├── components/         # Reusable UI + layout
    │   │   ├── ui/             # Button, Input, Card, Modal…
    │   │   ├── layout/         # Sidebar, Navbar, DashboardLayout
    │   │   └── shared/         # StatsCard, DataTable, DoctorCard…
    │   ├── hooks/              # useApi, useToast, useSocket
    │   ├── lib/                # utils.js
    │   ├── pages/
    │   │   ├── auth/           # Login, Register, ForgotPassword…
    │   │   ├── patient/        # Dashboard, Doctors, Appointments…
    │   │   ├── doctor/         # Dashboard, Appointments, Prescriptions…
    │   │   ├── assistant/      # Dashboard, Payment Verification
    │   │   ├── admin/          # Dashboard, Users, Doctors
    │   │   ├── superadmin/     # Full control dashboard
    │   │   └── shared/         # Profile, Messages, Notifications
    │   ├── services/           # Axios API service layer
    │   ├── store/              # Redux Toolkit slices
    │   └── main.jsx
    ├── vercel.json
    └── package.json
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS, Framer Motion |
| State | Redux Toolkit, React Redux |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + Refresh Tokens |
| Files | Multer + Cloudinary |
| Email | Nodemailer |
| Real-time | Socket.IO |
| Security | Helmet, CORS, Rate Limiting, Mongo Sanitize |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account
- Cloudinary account

### 1. Clone & Setup Backend

```bash
cd backend
cp .env.example .env
# Fill in your .env values
npm install
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

---

## 🌐 Deployment

### Backend → Render

1. Push backend to a GitHub repo
2. Create new **Web Service** on Render
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add all environment variables from `.env.example`
6. Copy the deployed URL (e.g., `https://doctor-hub-api.onrender.com`)

### Frontend → Vercel

1. Push frontend to GitHub
2. Import to Vercel
3. Set environment variable:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-render-url.onrender.com`
4. Deploy — `vercel.json` handles SPA routing

---

## 🔐 User Roles & Access

| Role | Access |
|------|--------|
| **Patient** | Book appointments, upload payments, view prescriptions & medical history |
| **Doctor** | Manage appointments, add prescriptions, manage clinics, view analytics |
| **Assistant** | Verify payments, manage appointment requests |
| **Admin** | Manage all users, approve doctors, view analytics |
| **Super Admin** | Full platform control, audit logs, role management |

---

## 📋 Appointment Workflow

```
Patient books → Payment Pending → Patient uploads screenshot
→ Assistant verifies → Appointment Confirmed → Doctor consults
→ Doctor creates Prescription → Medical History updated
```

---

## 🔒 Security Features

- JWT Authentication with refresh token rotation
- Password hashing with bcrypt (12 rounds)
- Role-Based Access Control (RBAC)
- Rate limiting (auth: 10/15min, general: 200/15min)
- MongoDB injection protection (mongoSanitize)
- HTTP security headers (Helmet)
- CORS with whitelist
- XSS protection
- HTTP Parameter Pollution protection
- Audit logging for all sensitive actions

---

## 🏥 Medical History Rules

- Records are **append-only** — cannot be edited or deleted
- Prescriptions are **immutable** after creation
- Full audit trail maintained forever
- Only doctors can add new records
- Patients cannot modify prescriptions

---

## 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh-token` | Refresh JWT |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/doctors` | List/search doctors |
| GET | `/api/doctors/:id` | Doctor detail |
| POST | `/api/doctors` | Create doctor profile |
| PUT | `/api/doctors/:id/approve` | Approve doctor |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments` | List appointments |
| PUT | `/api/appointments/:id` | Update status |
| POST | `/api/payments/:id/upload` | Upload payment proof |
| PUT | `/api/payments/:id/verify` | Verify/reject payment |
| GET | `/api/history/me` | Patient medical history |
| POST | `/api/history/:patientId/records` | Add medical record |
| POST | `/api/prescriptions` | Create prescription |
| GET | `/api/prescriptions` | List prescriptions |
| GET | `/api/messages/conversations` | List conversations |
| POST | `/api/messages` | Send message |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/analytics/overview` | Platform stats (Admin) |

---

## 📦 Environment Variables

### Backend `.env`
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=...
JWT_REFRESH_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
EMAIL_FROM=Doctor Hub <noreply@doctorhub.com>
FRONTEND_URL=https://your-frontend.vercel.app
COOKIE_SECRET=...
```

### Frontend `.env`
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#2563EB` |
| Secondary | `#14B8A6` |
| Accent | `#8B5CF6` |
| Success | `#22C55E` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Background | `#F8FAFC` |
| Dark BG | `#0F172A` |

---

Built with ❤️ — Doctor Hub © 2024
