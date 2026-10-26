import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonationsListPage from './pages/DonationsListPage';
import DonationDetailsPage from './pages/DonationDetailsPage';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard from './pages/NgoDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ImpactPage from './pages/ImpactPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/donations" element={<DonationsListPage />} />
                <Route path="/donations/:id" element={<DonationDetailsPage />} />
                <Route path="/impact" element={<ImpactPage />} />

                {/* Role-Protected Routes */}
                <Route
                  path="/donor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['donor', 'admin']}>
                      <DonorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ngo/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ngo', 'admin']}>
                      <NgoDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteer/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['volunteer', 'admin']}>
                      <VolunteerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
