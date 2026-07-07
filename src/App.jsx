import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/GlobalStateContext';

// Import All Master Screens
import LandingPage from './pages/LandingPage';
import AuthSuite from './pages/AuthSuite';
import DonorDashboard from './pages/DonorDashboard';
import NgoConsole from './pages/NgoConsole';
import AdminDashboard from './pages/AdminDashboard';
import SearchDirectory from './pages/SearchDirectory';
import NgoProfile from './pages/NgoProfile';
import RequestWizard from './pages/RequestWizard';
import SmartMatchVisualizer from './pages/SmartMatchVisualizer';
import ChatTerminal from './pages/ChatTerminal';
import LogisticsTracking from './pages/LogisticsTracking';
import ImpactAnalytics from './pages/ImpactAnalytics';
import NotificationCenter from './pages/NotificationCenter';
import UserProfile from './pages/UserProfile';
import SettingsTerminal from './pages/SettingsTerminal';

// New Informational Pages
import Bridge from './pages/Bridge';
import About from './pages/About';
import Contact from './pages/Contact';
import BrandIdentity from './pages/BrandIdentity';
import NotFound from './pages/NotFound';

// Role-Based Access Control Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'ngo') return <Navigate to="/ngo" replace />;
    return <Navigate to="/donor" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Screen 1: Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Screen 2: Authentication Core Suite */}
        <Route path="/auth" element={<AuthSuite />} />

        {/* Screen 6: Discover Directory */}
        <Route path="/discover" element={<SearchDirectory />} />
        <Route path="/search" element={<Navigate to="/discover" replace />} />

        {/* Screen 7: NGO Public Profile */}
        <Route path="/ngo/:id" element={<NgoProfile />} />

        {/* Screen 12: Public Impact Analytics Dashboard */}
        <Route path="/impact" element={<ImpactAnalytics />} />

        {/* Screen 11: End-to-End Logistical Tracking Stream */}
        <Route path="/tracking/:id" element={<LogisticsTracking />} />

        {/* New Public Pages */}
        <Route path="/bridge" element={<Bridge />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/brand" element={<BrandIdentity />} />

        {/* --- PROTECTED ROUTES --- */}

        {/* Screen 3: The Donor Dashboard Workspace (Donor Only) */}
        <Route
          path="/donor"
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DonorDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/donor-dashboard" element={<Navigate to="/donor" replace />} />

        {/* Screen 4: NGO Control Console (NGO Only) */}
        <Route
          path="/ngo"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <NgoConsole />
            </ProtectedRoute>
          }
        />
        <Route path="/ngo-dashboard" element={<Navigate to="/ngo" replace />} />

        {/* Screen 5: Platform Integrity Control Center (Admin Only) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />

        {/* Screen 8: Donation Request Logistics Wizard (Donor Only) */}
        <Route
          path="/request-wizard"
          element={
            <ProtectedRoute allowedRoles={['donor']}>
              <RequestWizard />
            </ProtectedRoute>
          }
        />

        {/* Screen 9: Smart Matching Recommendation Visualizer */}
        <Route
          path="/smart-match"
          element={
            <ProtectedRoute allowedRoles={['donor', 'ngo', 'admin']}>
              <SmartMatchVisualizer />
            </ProtectedRoute>
          }
        />

        {/* Screen 10: Reactive Communication Core */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatTerminal />
            </ProtectedRoute>
          }
        />

        {/* Screen 13: System Notification Center */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationCenter />
            </ProtectedRoute>
          }
        />

        {/* Screen 14: User Identity Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* Screen 15: Global settings */}
        <Route path="/settings" element={<SettingsTerminal />} />

        {/* Custom 404 Wildcard Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
