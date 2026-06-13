import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Bell, Moon, Sun, Search, LogOut, User, Settings, ChevronDown,
} from 'lucide-react';
import { toggleDarkMode, toggleSidebar } from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { markAllNotificationsRead } from '../../store/slices/notificationSlice';
import { getInitials, timeAgo } from '../../lib/utils';
import { cn } from '../../lib/utils';

const Navbar = ({ onMobileMenuOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const rolePrefix = {
    patient: '/patient',
    doctor: '/doctor',
    assistant: '/assistant',
    admin: '/admin',
    super_admin: '/superadmin',
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await dispatch(logoutUser());
    navigate('/login');
  };

  const recentNotifs = notifications.slice(0, 5);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Menu + Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuOpen}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode */}
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-premium border border-gray-100 dark:border-slate-700 overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => { dispatch(markAllNotificationsRead()); }}
                        className="text-xs text-primary-600 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {recentNotifs.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No notifications</p>
                      </div>
                    ) : (
                      recentNotifs.map((notif) => (
                        <div
                          key={notif._id}
                          className={cn(
                            'p-4 border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors',
                            !notif.isRead && 'bg-primary-50/50 dark:bg-primary-900/10'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {!notif.isRead && <div className="w-2 h-2 bg-primary-600 rounded-full mt-1.5 flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 dark:text-white">{notif.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-100 dark:border-slate-700">
                    <Link
                      to={`${rolePrefix[user?.role]}/notifications`}
                      onClick={() => setNotifOpen(false)}
                      className="block text-center text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                    >
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                {user?.profilePicture?.url
                  ? <img src={user.profilePicture.url} alt="" className="w-full h-full object-cover" />
                  : getInitials(user?.firstName, user?.lastName)
                }
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-300">
                {user?.firstName}
              </span>
              <ChevronDown className="hidden md:block w-4 h-4 text-gray-400" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-premium border border-gray-100 dark:border-slate-700 overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                    <p className="font-semibold text-sm text-slate-800 dark:text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      to={`${rolePrefix[user?.role]}/profile`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link
                      to={`${rolePrefix[user?.role]}/profile`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
