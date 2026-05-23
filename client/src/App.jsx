import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';

// Components
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Destinations from './pages/Destinations';
import Packages from './pages/Packages';
import Hotels from './pages/Hotels';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

// Protected Pages (shared)
import Profile from './pages/Profile';
import Transport from './pages/Transport';
import Notifications from './pages/Notifications';
import TripPlanner from './pages/TripPlanner';
import Settings from './pages/Settings';

// Tourist Pages
import TouristDashboard from './pages/tourist/TouristDashboard';
import MyTrips from './pages/tourist/MyTrips';
import TripItinerary from './pages/tourist/TripItinerary';
import SavedDestinations from './pages/tourist/SavedDestinations';
import AIRecommendations from './pages/tourist/AIRecommendations';

// Agency Pages
import AgencyDashboard from './pages/agency/AgencyDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Routes>
      {/* Public Routes - Wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/hotels" element={<Hotels />} />
      </Route>

      {/* Auth Routes - No MainLayout (Full-screen) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* General Protected Routes - Shared by all authenticated users */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/planner" element={<TripPlanner />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
      </Route>

      {/* Tourist Protected Routes */}
      <Route element={<ProtectedRoute requiredRole="tourist"><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<TouristDashboard />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/trip-itinerary/:tripId" element={<TripItinerary />} />
        <Route path="/saved" element={<SavedDestinations />} />
        <Route path="/ai-recommendations" element={<AIRecommendations />} />
      </Route>

      {/* Agency Protected Routes */}
      <Route element={<ProtectedRoute requiredRole="agency"><MainLayout /></ProtectedRoute>}>
        <Route path="/agency/dashboard" element={<AgencyDashboard />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute requiredRole="authority"><MainLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" />} />
    </Routes>
  );
}

export default App;
