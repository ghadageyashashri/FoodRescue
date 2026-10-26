import React from 'react';

export default function AlertMessage({ type = 'danger', message, onClose }) {
  if (!message) return null;

  const iconMap = {
    danger: 'bi-exclamation-triangle-fill',
    success: 'bi-check-circle-fill',
    warning: 'bi-exclamation-circle-fill',
    info: 'bi-info-circle-fill',
  };

  return (
    <div className={`alert alert-${type} d-flex align-items-center justify-content-between shadow-sm animate-fade-in`} role="alert">
      <div className="d-flex align-items-center gap-2">
        <i className={`bi ${iconMap[type] || 'bi-info-circle'} fs-5`}></i>
        <span>{message}</span>
      </div>
      {onClose && (
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
      )}
    </div>
  );
}
