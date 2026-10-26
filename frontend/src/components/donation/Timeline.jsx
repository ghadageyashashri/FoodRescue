import React from 'react';
import StatusBadge from '../common/StatusBadge';

export default function Timeline({ history = [] }) {
  if (!history || history.length === 0) {
    return <div className="text-muted small">No lifecycle history recorded yet.</div>;
  }

  return (
    <div className="timeline">
      {history.map((item, idx) => (
        <div key={item._id || idx} className="timeline-item">
          <div className={`timeline-dot ${idx === history.length - 1 ? 'completed' : ''}`}></div>
          <div className="timeline-content">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-1">
              <div className="d-flex align-items-center gap-2">
                {item.previousStatus && item.previousStatus !== 'INITIAL' ? (
                  <>
                    <StatusBadge status={item.previousStatus} />
                    <i className="bi bi-arrow-right text-muted small"></i>
                    <StatusBadge status={item.newStatus} />
                  </>
                ) : (
                  <StatusBadge status={item.newStatus} />
                )}
              </div>
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                {new Date(item.timestamp).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="d-flex align-items-center gap-2 mt-2">
              <i className="bi bi-person-fill text-secondary small"></i>
              <span className="fw-semibold small text-dark">
                {item.actor?.name || 'System'}
              </span>
              {item.actor?.role && (
                <span className="badge bg-light text-secondary border text-uppercase" style={{ fontSize: '0.65rem' }}>
                  {item.actor.role}
                </span>
              )}
            </div>

            {item.note && (
              <p className="text-secondary small mt-1 mb-0 bg-light p-2 rounded border-start border-3 border-success">
                {item.note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
