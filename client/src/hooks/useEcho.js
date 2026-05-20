import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import echo from '../services/echo';
import { addNotification } from '../redux/notificationsSlice';

const useEcho = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Connect to private channel for this specific user
      const channel = echo.private(`App.Models.User.${user.id}`);

      // Listen for BookingStatusUpdated
      channel.listen('.BookingStatusUpdated', (data) => {
        dispatch(addNotification({
          id: data.id + '-' + Date.now(), // unique id
          type: data.status === 'confirmed' ? 'success' : (data.status === 'cancelled' ? 'alert' : 'info'),
          title: data.status === 'confirmed' ? 'Booking Confirmed' : 'Booking Cancelled',
          message: data.message || `Your booking for ${data.place_name} is ${data.status}.`,
        }));
      });

      // Listen for our custom NotificationSent event
      const userChannel = echo.private(`user.${user.id}`);
      userChannel.listen('.notification.sent', (data) => {
        dispatch(addNotification({
          id: Date.now().toString(),
          type: data.type || 'info',
          title: 'System Notification',
          message: data.message,
        }));
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
