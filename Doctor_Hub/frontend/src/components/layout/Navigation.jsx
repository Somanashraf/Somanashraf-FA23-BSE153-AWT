import { Activity, Bell, CalendarCheck, ClipboardList, FileHeart, LayoutDashboard, LogIn, Menu, Moon, Search, ShieldCheck, Sun, UserCog, Users, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['PATIENT', 'DOCTOR', 'ASSISTANT', 'ADMIN', 'SUPER_ADMIN'] },
  { to: '/login', label: 'Secure Login', icon: LogIn, roles: ['PATIENT', 'DOCTOR', 'ASSISTANT', 'ADMIN', 'SUPER_ADMIN'] },
  { to: '/find-doctors', label: 'Find Doctors', icon: Search, roles: ['PATIENT', 'ADMIN', 'SUPER_ADMIN'] },
  { to: '/appointments', label: 'Appointments', icon: CalendarCheck, roles: ['PATIENT', 'DOCTOR', 'ASSISTANT', 'ADMIN', 'SUPER_ADMIN'] },
  { to: '/history', label: 'Medical History', icon: FileHeart, roles: ['PATIENT', 'DOCTOR'] },
  { to: '/prescriptions', label: 'Prescriptions', icon: ClipboardList, roles: ['PATIENT', 'DOCTOR'] },
  { to: '/verification', label: 'Verification', icon: ShieldCheck, roles: ['ASSISTANT', 'ADMIN', 'SUPER_ADMIN'] },
  { to: '/admin', label: 'Admin Control', icon: UserCog, roles: ['ADMIN', 'SUPER_ADMIN'] }
];

export function Sidebar({ open, setOpen }) {
  const { user } = useApp();
  return <aside className={`sidebar ${open ? 'open' : ''}`}>
    <div className="brand"><div className="brand-mark"><Activity size={22} /></div><div><strong>Doctor Hub</strong><span>Clinical SaaS</span></div><button className="icon ghost mobile-only" onClick={() => setOpen(false)}><X size={18} /></button></div>
    <nav>{nav.filter(item => item.roles.includes(user.role)).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>
    <div className="sidebar-note"><Users size={18} /><span>Append-only records protect prescriptions and medical history.</span></div>
  </aside>;
}

export function Topbar({ setOpen }) {
  const { user, theme, toggleTheme, switchRole } = useApp();
  return <header className="topbar">
    <button className="icon mobile-only" onClick={() => setOpen(true)}><Menu size={20} /></button>
    <div className="topbar-title"><span>Welcome back,</span><strong>{user.name}</strong></div>
    <div className="topbar-actions">
      <select value={user.role} onChange={(e) => switchRole(e.target.value)} aria-label="Switch role">
        <option>PATIENT</option><option>DOCTOR</option><option>ASSISTANT</option><option>ADMIN</option><option>SUPER_ADMIN</option>
      </select>
      <button className="icon" onClick={toggleTheme}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
      <button className="icon"><Bell size={18} /></button>
      <div className="avatar">{user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
    </div>
  </header>;
}

