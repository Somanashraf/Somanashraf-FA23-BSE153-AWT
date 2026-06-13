import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../store/slices/notificationSlice';
import PageHeader from '../../components/shared/PageHeader';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/ui/Button';
import { timeAgo, cn } from '../../lib/utils';

const typeIcons = { appointment: '📅', payment: '💳', prescription: '💊', message: '💬', system: '⚙️', account: '👤' };

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, isLoading } = useSelector((s) => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader title="Notifications" subtitle={`${unreadCount} unread`}
        actions={unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={() => dispatch(markAllNotificationsRead())} leftIcon={<CheckCheck className="w-4 h-4" />}>
            Mark all read
          </Button>
        )}
      />
      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <motion.div key={n._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => { if (!n.isRead) dispatch(markNotificationRead(n._id)); }}
              className={cn('flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                n.isRead ? 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700' : 'bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30 hover:bg-primary-50/80'
              )}>
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
                {typeIcons[n.type] || '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('text-sm font-medium', n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white')}>{n.title}</p>
                  {!n.isRead && <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
export default NotificationsPage;
