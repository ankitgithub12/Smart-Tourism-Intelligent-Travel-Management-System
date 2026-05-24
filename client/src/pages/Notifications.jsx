import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { markAllAsRead, markAsRead } from '../redux/notificationsSlice';

const Notifications = () => {
  const notifications = useSelector((state) => state.notifications.notifications);
  const dispatch = useDispatch();

  const getIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="text-red-500" size={24} />;
      case 'info':
        return <Info className="text-blue-500" size={24} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'reminder':
        return <Clock className="text-orange-500" size={24} />;
      default:
        return <Bell className="text-gray-500" size={24} />;
    }
  };

  const getBgColor = (type, read) => {
    if (read) return 'bg-white';
    switch (type) {
      case 'alert':
        return 'bg-red-55/40 dark:bg-red-950/20';
      case 'info':
        return 'bg-blue-55/40 dark:bg-blue-950/20';
      case 'success':
        return 'bg-green-55/40 dark:bg-emerald-950/20';
      case 'reminder':
        return 'bg-orange-55/40 dark:bg-orange-950/20';
      default:
        return 'bg-gray-55/40 dark:bg-slate-900/40';
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3">
              <Bell className="text-blue-600" size={32} />
              Notifications
            </h1>
            <p className="text-gray-500 font-medium">Stay updated with alerts and recommendations.</p>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={() => dispatch(markAllAsRead())}
              className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50 rounded-xl transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.map((notification, idx) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => dispatch(markAsRead(notification.id))}
              className={`p-5 rounded-2xl border cursor-pointer ${
                notification.read
                  ? 'border-gray-200 dark:border-slate-800/60 opacity-70 bg-white dark:bg-slate-900/20'
                  : 'border-blue-200 dark:border-blue-800/40 bg-blue-50/50 dark:bg-blue-950/10'
              } shadow-sm flex items-start gap-4 transition-all hover:shadow-md`}
            >
              <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-lg font-bold ${notification.read ? 'text-gray-600 dark:text-slate-400' : 'text-gray-900 dark:text-slate-100'}`}>
                    {notification.title || 'System Notification'}
                  </h3>
                  <span className="text-xs font-bold text-gray-400 whitespace-nowrap ml-4">
                    {formatTime(notification.time)}
                  </span>
                </div>
                <p className={`text-sm ${notification.read ? 'text-gray-500 dark:text-slate-500' : 'text-gray-700 dark:text-slate-300 font-medium'}`}>
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 mt-3 hidden sm:block"></div>
              )}
            </motion.div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-20 bg-white/40 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              <Bell className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
              <h3 className="font-bold text-lg">No Notifications</h3>
              <p className="text-sm text-slate-500 mt-1">We will notify you when something updates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
