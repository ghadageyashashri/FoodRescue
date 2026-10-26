import React from 'react';

export default function StatCard({ title, value, icon, gradientClass = 'stat-gradient-1', subtitle }) {
  return (
    <div className="card h-100 card-hover border-0 shadow-sm overflow-hidden position-relative">
      <div className="card-body p-4 d-flex justify-content-between align-items-center">
        <div>
          <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <h2 className="display-6 fw-bold mb-0 text-dark mt-1">{value}</h2>
          {subtitle && (
            <p className="text-secondary small mb-0 mt-1" style={{ fontSize: '0.8rem' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={`d-flex align-items-center justify-content-center text-white rounded-circle shadow-sm ${gradientClass}`}
          style={{ width: '56px', height: '56px', fontSize: '1.5rem', flexShrink: 0 }}
        >
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
      <div
        className={`position-absolute bottom-0 start-0 end-0 ${gradientClass}`}
        style={{ height: '4px' }}
      ></div>
    </div>
  );
}
