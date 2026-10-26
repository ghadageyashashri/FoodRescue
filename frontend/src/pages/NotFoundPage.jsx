import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container py-5 text-center">
      <div className="py-5" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div className="display-1 fw-bold text-success mb-3">404</div>
        <h3 className="fw-bold text-dark mb-2">Page Not Found</h3>
        <p className="text-muted mb-4">
          The page you are looking for does not exist, has been moved, or is temporarily unavailable.
        </p>
        <Link to="/" className="btn btn-primary px-4 py-2 fw-semibold">
          <i className="bi bi-house-door-fill me-2"></i> Return to Safety (Home)
        </Link>
      </div>
    </div>
  );
}
