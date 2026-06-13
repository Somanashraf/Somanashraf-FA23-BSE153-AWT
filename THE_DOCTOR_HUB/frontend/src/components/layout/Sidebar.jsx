import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Users, Calendar, CreditCard, FileText, MessageSquare,
  Bell, Settings, LogOut, ChevronLeft, Stethoscope, Activity,
  UserCheck, BarChart3, ClipboardList, Building2, Shield, History,
  UserCog, Search, Clock,
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleSidebarCollapsed } from '../../store/slices/uiSlice';
import { cn, getInitials } from '../../lib/utils';

const ROLE_MENUS = {
  patient: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/patient/dashboard' },
    { label: 'Find Doctors', icon: Search, path: '/patient/doctors' },
    { label: 'Appointments', icon: Calendar, path: '/patient/appointments' },
    { label: 'Payments', icon: CreditCard, path: '/patient/payments' },
    { label: 'Prescriptions', icon: FileText, path: '/patient/prescriptions' },
    { label: 'Medical History', icon: ClipboardList, path: '/patient/medical-history' },
    { label: 'Messages', icon: MessageSquare, path: '/patient/messages' },
    { label: 'Notifications', icon: Bell, path: '/patient/notifications' },
    { label: 'Profile', icon: Settings, path: '/patient/profile' },
  ],
  doctor: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
    { label: 'Setup Profile', icon: UserCog, path: '/doctor/setup-profile' },
    { label: 'My Schedule', icon: Clock, path: '/doctor/schedule' },
    { label: 'Appointments', icon: Calendar, path: '/doctor/appointments' },
    { label: 'My Patients', icon: Users, path: '/doctor/patients' },
    { label: 'Prescriptions', icon: FileText, path: '/doctor/prescriptions' },
    { label: 'Clinics', icon: Building2, path: '/doctor/clinics' },
    { label: 'Analytics', icon: BarChart3, path: '/doctor/analytics' },
    { label: 'Messages', icon: MessageSquare, path: '/doctor/messages' },
    { label: 'Notifications', icon: Bell, path: '/doctor/notifications' },
    { label: 'Profile', icon: Settings, path: '/doctor/profile' },
  ],
  assistant: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/assistant/dashboard' },
    { label: 'Pending Payments', icon: CreditCard, path: '/assistant/payments' },
    { label: 'Appointments', icon: Calendar, path: '/assistant/appointments' },
    { label: 'Notifications', icon: Bell, path: '/assistant/notifications' },
    { label: 'Profile', icon: Settings, path: '/assistant/profile' },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Doctors', icon: Stethoscope, path: '/admin/doctors' },
    { label: 'Appointments', icon: Calendar, path: '/admin/appointments' },
    { label: 'Payments', icon: CreditCard, path: '/admin/payments' },
    { label: 'Clinics', icon: Building2, path: '/admin/clinics' },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
    { label: 'Profile', icon: Settings, path: '/admin/profile' },
  ],
  super_admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/superadmin/dashboard' },
    { label: 'All Users', icon: Users, path: '/superadmin/users' },
    { label: 'Doctors', icon: Stethoscope, path: '/superadmin/doctors' },
    { label: 'Admins', icon: Shield, path: '/superadmin/admins' },
    { label: 'Appointments', icon: Calendar, path: '/superadmin/appointments' },
    { label: 'Payments', icon: CreditCard, path: '/superadmin/payments' },
    { label: 'Analytics', icon: BarChart3, path: '/superadmin/analytics' },
    { label: 'Audit Logs', icon: History, path: '/superadmin/audit-logs' },
    { label: 'Roles & Permissions', icon: UserCog, path: '/superadmin/roles' },
    { label: 'System Settings', icon: Settings, path: '/superadmin/settings' },
  ],
};

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { sidebarCollapsed, darkMode } = useSelector((state) => state.ui);
  const { unreadCount } = useSelector((state) => state.notifications);

  const menuItems = ROLE_MENUS[user?.role] || [];

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const roleColors = {
    patient: 'from-blue-600 to-cyan-500',
    doctor: 'from-emerald-600 to-teal-500',
    assistant: 'from-purple-600 to-indigo-500',
    admin: 'from-orange-500 to-red-500',
    super_admin: 'from-rose-600 to-pink-600',
  };

  const roleLabels = {
    patient: 'Patient',
    doctor: 'Doctor',
    assistant: 'Assistant',
    admin: 'Admin',
    super_admin: 'Super Admin',
  };

  const sidebarContent = (
    <div className={cn(
      'flex flex-col h-full',
      sidebarCollapsed ? 'w-16' : 'w-64',
      'transition-all duration-300'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center p-4 border-b border-gray-100 dark:border-slate-700',
        sidebarCollapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className={cn(
          'w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0',
          'from-primary-600 to-secondary-500'
        )}>
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <span className="font-bold text-lg text-slate-800 dark:text-white">Doctor</span>
            <span className="font-bold text-lg text-primary-600 dark:text-primary-400">Hub</span>
          </div>
        )}
      </div>

      {/* User info */}
      {!sidebarCollapsed && (
        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 bg-gradient-to-br',
              roleColors[user?.role] || 'from-primary-600 to-secondary-500'
            )}>
              {user?.profilePicture?.url
                ? <img src={user.profilePicture.url} alt="" className="w-full h-full rounded-full object-cover" />
                : getInitials(user?.firstName, user?.lastName)
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full text-white font-medium bg-gradient-to-r',
                roleColors[user?.role]
              )}>
                {roleLabels[user?.role]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative',
              'text-sm font-medium',
              isActive
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white',
              sidebarCollapsed && 'justify-center'
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-primary-600 dark:text-primary-400' : '')} />
                {!sidebarCollapsed && (
                  <span className="flex-1">{item.label}</span>
                )}
                {!sidebarCollapsed && item.label === 'Notifications' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 dark:border-slate-700 space-y-1">
        <button
          onClick={() => dispatch(toggleSidebarCollapsed())}
          className={cn(
            'hidden lg:flex items-center gap-3 w-full px-3 py-2.5 rounded-lg',
            'text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white',
            'transition-all duration-200 text-sm font-medium',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <ChevronLeft className={cn('w-5 h-5 transition-transform', sidebarCollapsed && 'rotate-180')} />
          {!sidebarCollapsed && 'Collapse'}
        </button>
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg',
            'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
            'transition-all duration-200 text-sm font-medium',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && 'Logout'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0',
        'bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-700',
        'overflow-hidden transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 z-50 border-r border-gray-100 dark:border-slate-700 overflow-hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
