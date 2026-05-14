import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, logoutUser, clearError, forgotPassword, resetPassword } from '../redux/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload?.user?.role;
      navigate(role === 'admin' || role === 'authority' ? '/admin' : '/dashboard');
    }
    return result;
  };

  const register = async (userData) => {
    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
    return result;
  };

  const logout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const sendForgotPasswordLink = async (email) => {
    return await dispatch(forgotPassword(email));
  };

  const resetUserPassword = async (data) => {
    return await dispatch(resetPassword(data));
  };

  const dismissError = () => dispatch(clearError());

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    sendForgotPasswordLink,
    resetUserPassword,
    dismissError,
    role: user?.role || null,
    isAdmin: user?.role === 'admin' || user?.role === 'authority',
  };
};

export default useAuth;
