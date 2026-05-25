import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, Info, CheckCircle, CreditCard, Car, UserCheck, Calendar, Megaphone } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { markNotificationRead, markAllNotificationsRead, clearAllNotifications } from '../redux/notificationsSlice';
import { Link } from 'react-router-dom';

const categoryIcons = {
  booking: CheckCircle,
  payment: CreditCard,
  budget: AlertTriangle,
  vehicle: Car,
  guide: UserCheck,
  schedule: Calendar,
  update: Megaphone,
};

const typeColors = {
  success: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  alert: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  info: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
};

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (t) => {
    if (!t) return '';
    try {
      const d = new Date(t);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-[hsl(var(--primary)/0.05)] transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className={unreadCount > 0 ? 'text-[hsl(var(--primary))]' : 'opacity-60'} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[360px] max-w-[92vw] glass-surface rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[999]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-[hsl(var(--primary))]" />
                <h3 className="text-sm font-extrabold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-black rounded-md">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={() => dispatch(markAllNotificationsRead())}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck size={14} className="text-emerald-400" />
                    </button>
                    <button
                      onClick={() => dispatch(clearAllNotifications())}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      title="Clear all"
                    >
                      <Trash2 size={14} className="text-rose-400" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[380px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.slice(0, 20).map((notif) => {
                  const colors = typeColors[notif.type] || typeColors.info;
                  const IconComp = categoryIcons[notif.category] || Info;
                  return (
                    <div
                      key={notif.id || notif.notification_id}
                      onClick={() => !notif.is_read && dispatch(markNotificationRead(notif.id || notif.notification_id))}
                      className={`px-4 py-3 border-b border-white/5 flex items-start gap-3 cursor-pointer transition-all hover:bg-white/3 ${
                        !notif.is_read ? 'bg-[hsl(var(--primary)/0.03)] font-semibold' : 'opacity-60'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl ${colors.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <IconComp size={14} className={colors.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-xs font-extrabold truncate">{notif.title || 'Notification'}</p>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-[hsl(var(--text-muted))] mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[9px] text-[hsl(var(--text-muted))] opacity-50 mt-1 font-semibold">
                          {formatTime(notif.time || notif.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center">
                  <Bell size={28} className="mx-auto opacity-20 mb-2" />
                  <p className="text-xs text-[hsl(var(--text-muted))] font-semibold">No notifications yet</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-white/5 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setOpen(false)}
                  className="text-[10px] font-extrabold text-[hsl(var(--primary))] hover:underline uppercase tracking-wider"
                >
                  View All Notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
