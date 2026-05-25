import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import echo from '../services/echo';
import { addNotification, fetchNotifications } from '../redux/notificationsSlice';
import toast from 'react-hot-toast';

const useEcho = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Fetch stored notifications on login
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, user?.id, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const channel = echo.private(`App.Models.User.${user.id}`);

      channel.listen('.BookingStatusUpdated', (data) => {
        const notif = {
          id: 'booking-' + data.id + '-' + Date.now(),
          type: data.status === 'confirmed' ? 'success' : (data.status === 'cancelled' ? 'alert' : 'info'),
          title: data.status === 'confirmed' ? 'Booking Confirmed' : 'Booking Cancelled',
          message: data.message || `Your booking for ${data.place_name} is ${data.status}.`,
          category: 'booking',
        };
        dispatch(addNotification(notif));
        
        if (data.status === 'confirmed') {
          toast.success(notif.message, { duration: 5000, icon: '✅' });
        } else {
          toast.error(notif.message, { duration: 5000, icon: '⚠️' });
        }
      });

      const userChannel = echo.private(`user.${user.id}`);
      userChannel.listen('.notification.sent', (data) => {
        const notif = {
          id: data.data?.notification_id || Date.now().toString(),
          notification_id: data.data?.notification_id,
          type: data.type || 'info',
          title: data.data?.title || 'Notification',
          message: data.message,
          category: data.data?.category || 'update',
        };
        dispatch(addNotification(notif));

        const toastIcon = data.type === 'success' ? '✅' : data.type === 'alert' ? '⚠️' : 'ℹ️';
        const toastFn = data.type === 'alert' ? toast.error : toast.success;
        toastFn(data.message, { duration: 5000, icon: toastIcon });
      });

      return () => {
        channel.stopListening('.BookingStatusUpdated');
        echo.leave(`App.Models.User.${user.id}`);
        userChannel.stopListening('.notification.sent');
        echo.leave(`user.${user.id}`);
      };
    }
  }, [isAuthenticated, user, dispatch]);
};

export default useEcho;
