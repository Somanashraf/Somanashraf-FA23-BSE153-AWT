import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCurrentUser } from './store/slices/authSlice';
import ToastContainer from './components/ui/Toast';

import DashboardLayout from './components/layout/DashboardLayout';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import LandingPage from './pages/LandingPage';

// Patient
import PatientDashboard from './pages/patient/PatientDashboard';
import FindDoctors from './pages/patient/FindDoctors';
import DoctorDetail from './pages/patient/DoctorDetail';
import PatientAppointments from './pages/patient/PatientAppointments';
import AppointmentDetail from './pages/patient/AppointmentDetail';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import MedicalHistory from './pages/patient/MedicalHistory';
import PatientPayments from './pages/patient/PatientPayments';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorAppointmentDetail from './pages/doctor/DoctorAppointmentDetail';
import AddPrescription from './pages/doctor/AddPrescription';
import ManageClinics from './pages/doctor/ManageClinics';
import DoctorProfileSetup from './pages/doctor/DoctorProfileSetup';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorAnalytics from './pages/doctor/DoctorAnalytics';
import DoctorSchedule from './pages/doctor/DoctorSchedule';

// Assistant
import AssistantDashboard from './pages/assistant/AssistantDashboard';
import PendingPayments from './pages/assistant/PendingPayments';
import PaymentVerification from './pages/assistant/PaymentVerification';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDoctors from './pages/admin/ManageDoctors';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminPayments from './pages/admin/AdminPayments';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import ManageClinicsAdmin from './pages/admin/ManageClinicsAdmin';

// Super Admin
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import AuditLogs from './pages/superadmin/AuditLogs';

// Shared
import NotificationsPage from './pages/shared/NotificationsPage';
import ProfilePage from './pages/shared/ProfilePage';
import MessagesPage from './pages/shared/MessagesPage';
import PrescriptionDetail from './pages/shared/PrescriptionDetail';

// ─────────────────────────────────────────────────────
const ROLE_REDIRECTS = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  assistant: '/assistant/dashboard',
  admin: '/admin/dashboard',
  super_admin: '/superadmin/dashboard',
};

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to={ROLE_REDIRECTS[user?.role] || '/login'} replace />;
  return children;
};

const LandingRoute = () => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (isAuthenticated) return <Navigate to={ROLE_REDIRECTS[user?.role] || '/patient/dashboard'} replace />;
  return <LandingPage />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (isAuthenticated) return <Navigate to={ROLE_REDIRECTS[user?.role] || '/patient/dashboard'} replace />;
  return children;
};

const P = ({ children }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
    {children}
  </motion.div>
);

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-background dark:bg-slate-900">
    <div className="text-center">
      <h1 className="text-8xl font-bold text-primary-600 mb-4">404</h1>
      <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">Page not found</p>
      <a href="/" className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium">Go Home</a>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────
const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, accessToken } = useSelector((s) => s.auth);
  const { darkMode } = useSelector((s) => s.ui);

  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);
  useEffect(() => { if (isAuthenticated && accessToken) dispatch(fetchCurrentUser()); }, []);

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* ── PUBLIC ── */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/" element={<LandingRoute />} />

        {/* ── PATIENT ── */}
        <Route path="/patient" element={<ProtectedRoute roles={['patient']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<P><PatientDashboard /></P>} />
          <Route path="doctors" element={<P><FindDoctors /></P>} />
          <Route path="doctors/:id" element={<P><DoctorDetail /></P>} />
          <Route path="appointments" element={<P><PatientAppointments /></P>} />
          <Route path="appointments/:id" element={<P><AppointmentDetail /></P>} />
          <Route path="prescriptions" element={<P><PatientPrescriptions /></P>} />
          <Route path="prescriptions/:id" element={<P><PrescriptionDetail /></P>} />
          <Route path="medical-history" element={<P><MedicalHistory /></P>} />
          <Route path="payments" element={<P><PatientPayments /></P>} />
          <Route path="messages" element={<P><MessagesPage /></P>} />
          <Route path="notifications" element={<P><NotificationsPage /></P>} />
          <Route path="profile" element={<P><PatientProfile /></P>} />
        </Route>

        {/* ── DOCTOR ── */}
        <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<P><DoctorDashboard /></P>} />
          <Route path="setup-profile" element={<P><DoctorProfileSetup /></P>} />
          <Route path="schedule" element={<P><DoctorSchedule /></P>} />
          <Route path="appointments" element={<P><DoctorAppointments /></P>} />
          <Route path="appointments/:id" element={<P><DoctorAppointmentDetail /></P>} />
          <Route path="prescriptions" element={<P><PatientPrescriptions /></P>} />
          <Route path="prescriptions/new" element={<P><AddPrescription /></P>} />
          <Route path="prescriptions/:id" element={<P><PrescriptionDetail /></P>} />
          <Route path="patients" element={<P><DoctorPatients /></P>} />
          <Route path="clinics" element={<P><ManageClinics /></P>} />
          <Route path="analytics" element={<P><DoctorAnalytics /></P>} />
          <Route path="messages" element={<P><MessagesPage /></P>} />
          <Route path="notifications" element={<P><NotificationsPage /></P>} />
          <Route path="profile" element={<P><ProfilePage /></P>} />
        </Route>

        {/* ── ASSISTANT ── */}
        <Route path="/assistant" element={<ProtectedRoute roles={['assistant']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<P><AssistantDashboard /></P>} />
          <Route path="payments" element={<P><PendingPayments /></P>} />
          <Route path="payments/:id" element={<P><PaymentVerification /></P>} />
          <Route path="appointments" element={<P><AdminAppointments /></P>} />
          <Route path="notifications" element={<P><NotificationsPage /></P>} />
          <Route path="profile" element={<P><ProfilePage /></P>} />
        </Route>

        {/* ── ADMIN ── */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin', 'super_admin']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<P><AdminDashboard /></P>} />
          <Route path="users" element={<P><ManageUsers /></P>} />
          <Route path="doctors" element={<P><ManageDoctors /></P>} />
          <Route path="appointments" element={<P><AdminAppointments /></P>} />
          <Route path="payments" element={<P><AdminPayments /></P>} />
          <Route path="analytics" element={<P><AdminAnalytics /></P>} />
          <Route path="clinics" element={<P><ManageClinicsAdmin /></P>} />
          <Route path="notifications" element={<P><NotificationsPage /></P>} />
          <Route path="profile" element={<P><ProfilePage /></P>} />
        </Route>

        {/* ── SUPER ADMIN ── */}
        <Route path="/superadmin" element={<ProtectedRoute roles={['super_admin']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<P><SuperAdminDashboard /></P>} />
          <Route path="users" element={<P><ManageUsers /></P>} />
          <Route path="doctors" element={<P><ManageDoctors /></P>} />
          <Route path="admins" element={<P><ManageUsers /></P>} />
          <Route path="appointments" element={<P><AdminAppointments /></P>} />
          <Route path="payments" element={<P><AdminPayments /></P>} />
          <Route path="analytics" element={<P><AdminAnalytics /></P>} />
          <Route path="audit-logs" element={<P><AuditLogs /></P>} />
          <Route path="roles" element={<P><ManageUsers /></P>} />
          <Route path="settings" element={<P><ProfilePage /></P>} />
          <Route path="notifications" element={<P><NotificationsPage /></P>} />
          <Route path="profile" element={<P><ProfilePage /></P>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
    <ToastContainer />
  </BrowserRouter>
);

export default App;
