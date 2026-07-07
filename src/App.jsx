import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/GlobalStateContext';

// Import All 15 Master Screens
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

// Role-Based Access Control Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If authenticated but role not allowed, redirect to correct landing/dashboard
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

        {/* Screen 6: Dynamic Faceted Search & NGO Directory (Discover Dashboard) */}
        <Route path="/discover" element={<SearchDirectory />} />
        {/* Alias search path to discover */}
        <Route path="/search" element={<Navigate to="/discover" replace />} />

        {/* Screen 7: NGO Portfolio & Public Verification Profile */}
        <Route path="/ngo/:id" element={<NgoProfile />} />

        {/* Screen 12: Public Impact Analytics Dashboard */}
        <Route path="/impact" element={<ImpactAnalytics />} />

        {/* Screen 11: End-to-End Logistical Tracking Stream */}
        <Route path="/tracking/:id" element={<LogisticsTracking />} />

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
        {/* Backwards compatibility */}
        <Route path="/donor-dashboard" element={<Navigate to="/donor" replace />} />

        {/* Screen 4: Inbound Logistics NGO Control Console (NGO Only) */}
        <Route
          path="/ngo"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <NgoConsole />
            </ProtectedRoute>
          }
        />
        {/* Backwards compatibility */}
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
        {/* Backwards compatibility */}
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

        {/* Screen 9: Smart Matching Recommendation Visualizer (Donor, NGO, Admin) */}
        <Route
          path="/smart-match"
          element={
            <ProtectedRoute allowedRoles={['donor', 'ngo', 'admin']}>
              <SmartMatchVisualizer />
            </ProtectedRoute>
          }
        />

        {/* Screen 10: Reactive Communication Core (Chat Terminal - Any Auth User) */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatTerminal />
            </ProtectedRoute>
          }
        />

        {/* Screen 13: System Notification Center (Any Auth User) */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationCenter />
            </ProtectedRoute>
          }
        />

        {/* Screen 14: User Identity Profile Node & Ledger Sheet (Any Auth User) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* Screen 15: Global Application System Settings Configuration Terminal */}
        <Route path="/settings" element={<SettingsTerminal />} />

        {/* Fallback Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
