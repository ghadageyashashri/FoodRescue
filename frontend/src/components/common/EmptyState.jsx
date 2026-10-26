import React from 'react';

export default function EmptyState({ icon = 'bi-inbox', title = 'No records found', description, actionText, onAction }) {
  return (
    <div className="text-center py-5 px-3">
      <div
        className="d-inline-flex align-items-center justify-content-center bg-light text-secondary rounded-circle mb-3"
        style={{ width: '80px', height: '80px', fontSize: '2rem' }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
      <h5 className="fw-bold text-dark mb-1">{title}</h5>
      {description && <p className="text-muted small mx-auto" style={{ maxWidth: '400px' }}>{description}</p>}
      {actionText && onAction && (
        <button className="btn btn-outline-primary btn-sm mt-3 px-3" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
