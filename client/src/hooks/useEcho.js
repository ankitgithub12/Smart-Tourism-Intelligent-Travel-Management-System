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

      return () => {
        channel.stopListening('.BookingStatusUpdated');
        echo.leave(`App.Models.User.${user.id}`);
      };
    }
  }, [isAuthenticated, user, dispatch]);
};

export default useEcho;
