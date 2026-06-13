import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ToastContainer from '../ui/Toast';
import { fetchNotifications } from '../../store/slices/notificationSlice';
import { setDarkMode } from '../../store/slices/uiSlice';
import { cn } from '../../lib/utils';

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const { sidebarCollapsed, darkMode } = useSelector((state) => state.ui);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Apply dark mode to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Fetch notifications periodically
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
      const interval = setInterval(() => dispatch(fetchNotifications()), 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, dispatch]);

  return (
    <div className={cn('flex h-screen bg-background dark:bg-slate-900 overflow-hidden')}>
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMobileMenuOpen={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 lg:p-6 max-w-screen-2xl mx-auto w-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
