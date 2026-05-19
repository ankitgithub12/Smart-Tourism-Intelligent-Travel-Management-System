import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Wraps a route to require authentication.
 * Optionally accepts a `requiredRole` to restrict to specific roles.
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const dashboardRoutes = {
      authority: '/admin/dashboard',
      admin: '/admin/dashboard',
      agency: '/agency/dashboard',
      tourist: '/dashboard',
    };
    const dest = dashboardRoutes[user?.role] || '/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
};

export default ProtectedRoute;
