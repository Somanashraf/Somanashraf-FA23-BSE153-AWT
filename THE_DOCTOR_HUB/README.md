<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

<h1 align="center">Doctor Hub</h1>

<p align="center">
  <strong>Enterprise healthcare platform for appointments, prescriptions, and patient management.</strong><br />
  Built with the MERN stack — featuring role-based dashboards, real-time notifications, and a premium landing experience.
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#deployment">Deployment</a> ·
  <a href="#test-accounts">Test Accounts</a>
</p>

---

## Overview

**Doctor Hub** is a full-stack healthcare consultation platform that connects patients with doctors and streamlines clinic operations. It supports multi-role access, secure authentication, digital prescriptions, medical history tracking, and payment verification workflows.

```mermaid
flowchart LR
    A[Browser] --> B[Vercel · Frontend]
    B --> C[Render · Backend API]
    C --> D[(MongoDB Atlas)]
    B -. Socket.IO .-> C
```

---

## Features

| Module | Capabilities |
|--------|-------------|
| **Landing Page** | Animated hero, features showcase, testimonials, CTA |
| **Authentication** | JWT + refresh tokens, email verification, password reset |
| **Patient Portal** | Find doctors, book appointments, prescriptions, medical history |
| **Doctor Portal** | Schedule, consultations, prescriptions, clinic management |
| **Assistant Portal** | Payment verification, appointment management |
| **Admin Panel** | User management, analytics, doctor approval |
| **Super Admin** | Full platform control, audit logs, role management |
| **Real-time** | Live notifications via Socket.IO |

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Framer Motion, Redux Toolkit |
| **Forms & Validation** | React Hook Form, Zod |
| **Backend** | Node.js, Express.js, Mongoose |
| **Database** | MongoDB Atlas |
| **Auth & Security** | JWT, bcrypt, Helmet, CORS, Rate Limiting |
| **File Storage** | Cloudinary + local fallback |
| **Email** | Nodemailer |
| **Real-time** | Socket.IO |
| **Deployment** | Vercel (frontend) · Render (backend) |

---

## Project Structure

```
THE_DOCTOR_HUB/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Auth, rate limit, error handling
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   └── server.js         # Entry point
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/       # UI, layout, shared
│   │   ├── pages/            # Landing, auth, dashboards
│   │   ├── services/         # API layer
│   │   └── store/            # Redux slices
│   └── vercel.json
│
└── package.json              # Monorepo scripts
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- [Cloudinary](https://cloudinary.com/) account *(optional, for file uploads)*

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/doctor-hub.git
cd doctor-hub

# Install all dependencies
npm run install:all

# Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` with your MongoDB URI, JWT secrets, and other credentials.  
For local development, the default `frontend/.env` uses the Vite proxy — no changes needed.

### Seed Database

```bash
npm run seed
```

### Run Development Servers

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@doctorhub.com` | `Admin@12345` |
| Admin | `admin@doctorhub.com` | `Admin@12345` |
| Assistant | `assistant@doctorhub.com` | `Assistant@123` |
| Patient | `patient@doctorhub.com` | `Patient@123` |

> Re-run `npm run seed` to reset passwords or unlock accounts after failed login attempts.

---

## User Roles

```
Patient  →  Book appointments · View prescriptions · Medical history
Doctor   →  Manage patients · Prescriptions · Clinics · Analytics
Assistant → Verify payments · Manage appointments
Admin    →  User management · Doctor approval · Platform analytics
Super Admin → Full control · Audit logs · Role management
```

---

## Deployment

### 1. Backend — Render

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

Copy all variables from `backend/.env.example` into Render's environment settings.  
Set `FRONTEND_URL` to your Vercel deployment URL after frontend is live.

### 2. Frontend — Vercel

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

**Environment Variables:**

```env
VITE_API_URL=https://your-api.onrender.com/api
VITE_SOCKET_URL=https://your-api.onrender.com
```

### 3. Post-Deploy Checklist

- [ ] Backend `/health` endpoint returns `200`
- [ ] `FRONTEND_URL` in Render matches Vercel URL exactly
- [ ] MongoDB Atlas allows connections from `0.0.0.0/0`
- [ ] Run `npm run seed` against production database
- [ ] Login flow works end-to-end

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend and backend concurrently |
| `npm run dev:frontend` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `npm run seed` | Create or reset demo accounts |
| `npm run build` | Build frontend for production |
| `npm run install:all` | Install dependencies for both apps |

---

## Security

- JWT authentication with refresh token rotation
- Password hashing (bcrypt, 12 rounds)
- Role-based access control (RBAC)
- Rate limiting on auth endpoints
- MongoDB injection protection
- HTTP security headers (Helmet)
- CORS origin whitelist
- Append-only medical records & immutable prescriptions

---

## Environment Variables

| File | Purpose |
|------|---------|
| `backend/.env.example` | API, database, JWT, email, Cloudinary |
| `frontend/.env.example` | API URL, Socket URL |

> **Never commit `.env` files to version control.**

---

## License

This project is proprietary. All rights reserved.

<p align="center">
  <sub>Doctor Hub © 2024–2026</sub>
</p>
