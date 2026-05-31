<div align="center">

# Doctor Hub

**A Complete Healthcare Consultation & Medical History Management Platform**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

A comprehensive Final Year Project built with modern web technologies to streamline healthcare consultations, manage medical records, and facilitate real-time doctor-patient interactions.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Demo](#-demo-accounts) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 🌟 Features

### Frontend (React SaaS UI)
- 🎨 **Modern UI/UX** with dark mode support
- 📊 **Interactive Dashboards** with role-based layouts
- 📈 **Real-time Charts** using Chart.js
- 🎭 **Smooth Animations** with Framer Motion
- 🦴 **Skeleton Loading** for better UX
- 🔔 **Toast Notifications** for user feedback
- 📱 **Fully Responsive** design
- 📝 **Advanced Forms** with validation
- 📋 **Data Tables** with sorting and filtering

### Backend (Express MVC API)
- 🔐 **JWT Authentication** with refresh tokens
- 👥 **Role-Based Access Control (RBAC)**
- ✅ **Input Validation** with express-validator
- 📝 **Structured Logging** with Winston
- 📤 **Secure File Uploads** with Multer
- 🔌 **Real-time Notifications** via Socket.io
- 📄 **PDF Prescription Generation** with PDFKit
- 🛡️ **Security Headers** with Helmet
- 🚦 **Rate Limiting** for API protection
- 🏗️ **Clean Architecture** with service/repository layers

### Database (MySQL)
- 🗄️ **Normalized Schema** for data integrity
- 🌱 **Realistic Seed Data** for testing
- 🔗 **Foreign Key Constraints** for relationships
- 📊 **Optimized Queries** with proper indexing

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.7
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM 7.1.1
- **Charts**: Chart.js 4.4.7 + react-chartjs-2 5.2.0
- **Animations**: Framer Motion 11.15.0
- **Icons**: Lucide React 0.468.0
- **Real-time**: Socket.io Client 4.8.1

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express 4.21.2
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator 7.2.1
- **Database**: MySQL 8.0 + mysql2 3.11.5
- **ORM**: Custom repository pattern
- **Real-time**: Socket.io 4.8.1
- **PDF Generation**: PDFKit 0.15.2
- **Email**: Nodemailer 6.9.16
- **Logging**: Winston 3.17.0
- **Security**: Helmet 8.0.0, express-rate-limit 7.5.0

### Development Tools
- **Testing**: Jest 29.7.0, Vitest 2.1.8
- **Linting**: ESLint 9.17.0
- **Hot Reload**: Vite HMR, Nodemon 3.1.9
- **API Testing**: Supertest 7.0.0

---

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- MySQL 8.0 or higher
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/doctor-hub.git
cd doctor-hub
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Configure your `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=doctor_hub
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=5000
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Database Setup

Import the database schema and seed data:

```bash
# Create database and import schema
mysql -u root -p < database/schema.sql

# Import seed data
mysql -u root -p doctor_hub < database/seed.sql
```

---

## 👤 Demo Accounts

All seeded users use the default password: `Password@123`

| Role | Email | Permissions |
|------|-------|-------------|
| **Super Admin** | `superadmin@doctorhub.local` | Full system access, user management |
| **Admin** | `admin@doctorhub.local` | Admin dashboard, doctor management |
| **Doctor** | `sana.khan@doctorhub.local` | Patient consultations, prescriptions |
| **Assistant** | `assistant@doctorhub.local` | Appointment scheduling, records |
| **Patient** | `patient@doctorhub.local` | View records, book appointments |

---

## 🏗 Architecture

### Project Structure

```
doctor-hub/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── package.json
├── backend/                # Express backend API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Data access layer
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── config/         # Configuration files
│   │   ├── utils/          # Utility functions
│   │   ├── exceptions/     # Custom error classes
│   │   ├── socket/         # Socket.io handlers
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry point
│   ├── .env.example        # Environment template
│   └── package.json
├── database/               # MySQL schema and seeds
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
├── docs/                   # Documentation
│   ├── api.md              # API documentation
│   ├── diagrams/           # Architecture diagrams
│   └── testing.md          # Testing notes
└── README.md
```

### Design Patterns

- **MVC Architecture**: Separation of concerns with Model-View-Controller
- **Repository Pattern**: Abstract data access layer
- **Service Layer**: Business logic separation
- **Dependency Injection**: Loose coupling between components
- **Middleware Pattern**: Request processing pipeline
- **Observer Pattern**: Real-time event handling with Socket.io

---

## 📸 Screenshots

<!-- Add screenshots here -->
<div align="center">
  <p><i>Screenshots coming soon...</i></p>
</div>

---

## 🔧 API Documentation

Detailed API documentation is available in the `docs/` directory.

- **Endpoints**: RESTful API with proper HTTP methods
- **Authentication**: JWT-based with refresh token rotation
- **Error Handling**: Consistent error response format
- **Rate Limiting**: Configurable per-endpoint limits
- **Validation**: Request/response schema validation

---

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name** - Final Year Project

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

---

## 🙏 Acknowledgments

- Built as a Final Year Project for [Your University]
- Inspired by modern healthcare SaaS platforms
- Thanks to all open-source contributors

---

## 📞 Support

For support, email support@doctorhub.local or open an issue in the repository.

---

<div align="center">

**⭐ If you like this project, please give it a star!**

Made with ❤️ for healthcare

</div>
