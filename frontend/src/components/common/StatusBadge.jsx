import React from 'react';

const STATUS_ICONS = {
  AVAILABLE: 'bi-check2-circle',
  REQUESTED: 'bi-hourglass-split',
  ACCEPTED: 'bi-hand-thumbs-up',
  PICKUP_ASSIGNED: 'bi-person-check',
  PICKED_UP: 'bi-truck',
  DELIVERED: 'bi-geo-alt',
  RECEIVED: 'bi-box-seam',
  DISTRIBUTED: 'bi-heart-fill',
  COMPLETED: 'bi-check-all',
  CANCELLED: 'bi-x-circle',
  EXPIRED: 'bi-clock-history',
};

const STATUS_LABELS = {
  AVAILABLE: 'Available',
  REQUESTED: 'Requested',
  ACCEPTED: 'Accepted',
  PICKUP_ASSIGNED: 'Pickup Assigned',
  PICKED_UP: 'Picked Up',
  DELIVERED: 'Delivered',
  RECEIVED: 'Received',
  DISTRIBUTED: 'Distributed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

export default function StatusBadge({ status }) {
  const icon = STATUS_ICONS[status] || 'bi-info-circle';
  const label = STATUS_LABELS[status] || status;

  return (
    <span className={`badge-status badge-${status}`}>
      <i className={`bi ${icon}`}></i>
      <span>{label}</span>
    </span>
  );
}
