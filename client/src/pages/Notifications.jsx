import React from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: 'alert',
      title: 'High Crowd Alert',
      message: 'Amber Fort is currently experiencing high crowd density. Consider visiting after 3 PM.',
      time: '10 mins ago',
      read: false,
    },
    {
      id: 2,
      type: 'info',
      title: 'Smart Route Updated',
      message: 'A faster route to City Palace has been found saving you 15 minutes in traffic.',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      type: 'success',
      title: 'Booking Confirmed',
      message: 'Your guided tour for Nahargarh Fort on Oct 24 has been confirmed.',
      time: '2 hours ago',
      read: true,
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Upcoming Trip',
      message: 'Reminder: Your trip to Hawa Mahal is scheduled for tomorrow at 9:00 AM.',
      time: '1 day ago',
      read: true,
    }
  ];

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
        return 'bg-red-50';
      case 'info':
        return 'bg-blue-50';
      case 'success':
        return 'bg-green-50';
      case 'reminder':
        return 'bg-orange-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Bell className="text-blue-600" size={32} />
              Notifications
            </h1>
            <p className="text-gray-500 font-medium">Stay updated with alerts and recommendations.</p>
          </div>
          <button className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
            Mark all as read
          </button>
        </div>

        <div className="space-y-4">
          {notifications.map((notification, idx) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-5 rounded-2xl border ${notification.read ? 'border-gray-200' : 'border-transparent'} ${getBgColor(notification.type, notification.read)} shadow-sm flex items-start gap-4 transition-all hover:shadow-md`}
            >
              <div className="p-2 bg-white rounded-full shadow-sm shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-lg font-bold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs font-bold text-gray-400 whitespace-nowrap ml-4">
                    {notification.time}
                  </span>
                </div>
                <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                  {notification.message}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 mt-3 hidden sm:block"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
