import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container py-5 text-center">
        <div className="card shadow-sm p-5 max-w-md mx-auto" style={{ maxWidth: '500px' }}>
          <div className="text-warning display-4 mb-3">
            <i className="bi bi-shield-exclamation"></i>
          </div>
          <h3 className="fw-bold">Access Restricted</h3>
          <p className="text-muted">
            This section is restricted to <strong>{allowedRoles.join(', ')}</strong> accounts.
            You are currently signed in as a <strong>{user.role}</strong>.
          </p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
}
