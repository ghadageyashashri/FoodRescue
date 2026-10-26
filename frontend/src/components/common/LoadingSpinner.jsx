import React from 'react';

export default function LoadingSpinner({ message = 'Loading...', fullPage = false }) {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-5">
      <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted fw-semibold mb-0">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        {content}
      </div>
    );
  }

  return content;
}
