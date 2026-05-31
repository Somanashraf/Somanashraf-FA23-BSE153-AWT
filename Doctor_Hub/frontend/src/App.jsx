import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar, Topbar } from './components/layout/Navigation.jsx';
import { Toast } from './components/common/UI.jsx';
import { useApp } from './context/AppContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FindDoctors from './pages/FindDoctors.jsx';
import Appointments from './pages/Appointments.jsx';
import MedicalHistory from './pages/MedicalHistory.jsx';
import Prescriptions from './pages/Prescriptions.jsx';
import Verification from './pages/Verification.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';

export default function App() {
  const [open, setOpen] = useState(false);
  const { theme, toast } = useApp();
  return <div className={`app ${theme}`}>
    <Sidebar open={open} setOpen={setOpen} />
    <div className="shell"><Topbar setOpen={setOpen} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/find-doctors" element={<FindDoctors />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/history" element={<MedicalHistory />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
    <Toast toast={toast} />
  </div>;
}


