import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

const CATEGORY_IMAGES = {
  cooked_meals: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=60',
  raw_ingredients: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=60',
  packaged_groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=60',
  beverages: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=60',
  other: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=60',
};

export default function DonationCard({ donation }) {
  const imageUrl = donation.imageUrl || CATEGORY_IMAGES[donation.category] || CATEGORY_IMAGES.cooked_meals;
  
  const useByDate = new Date(donation.useByDate);
  const now = new Date();
  const hoursLeft = Math.round((useByDate - now) / (1000 * 60 * 60));
  const isExpiringSoon = hoursLeft > 0 && hoursLeft <= 6;
  const isExpired = hoursLeft <= 0;

  return (
    <div className="card h-100 card-hover overflow-hidden border-0 shadow-sm d-flex flex-column">
      {/* Image container with badges */}
      <div className="position-relative" style={{ height: '190px', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={donation.foodName}
          className="w-100 h-100 object-fit-cover"
          loading="lazy"
        />
        <div className="position-absolute top-0 start-0 m-2">
          <StatusBadge status={donation.status} />
        </div>
        <div className="position-absolute top-0 end-0 m-2">
          {donation.isVegetarian ? (
            <span className="badge bg-success-subtle text-success border border-success fw-bold d-flex align-items-center gap-1 shadow-sm">
              <i className="bi bi-circle-fill text-success" style={{ fontSize: '0.5rem' }}></i>
              <span>VEG</span>
            </span>
          ) : (
            <span className="badge bg-danger-subtle text-danger border border-danger fw-bold d-flex align-items-center gap-1 shadow-sm">
              <i className="bi bi-triangle-fill text-danger" style={{ fontSize: '0.5rem' }}></i>
              <span>NON-VEG</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="card-body p-3 d-flex flex-column flex-grow-1">
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="badge-category text-uppercase">{donation.category?.replace('_', ' ')}</span>
          <span className="text-muted small">•</span>
          <span className="fw-bold text-success small">
            {donation.quantity} {donation.unit}
          </span>
        </div>

        <h6 className="card-title fw-bold text-dark mb-2 text-truncate-2" style={{ lineHeight: '1.3' }}>
          {donation.foodName}
        </h6>

        <p className="card-text text-secondary small text-truncate-2 mb-3" style={{ fontSize: '0.82rem' }}>
          {donation.description}
        </p>

        {/* Location & Use-by Info */}
        <div className="mt-auto pt-2 border-top">
          <div className="d-flex align-items-center text-muted small mb-1">
            <i className="bi bi-geo-alt-fill text-danger me-1"></i>
            <span className="text-truncate">{donation.pickupAddress}</span>
          </div>

          <div className="d-flex align-items-center justify-content-between small">
            <div className="d-flex align-items-center text-muted">
              <i className="bi bi-clock me-1"></i>
              <span>Use by: {useByDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
            </div>

            {isExpired ? (
              <span className="badge bg-danger text-white">Expired</span>
            ) : isExpiringSoon ? (
              <span className="badge bg-warning text-dark">{hoursLeft}h left</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Card Footer action */}
      <div className="card-footer bg-white border-top-0 pt-0 pb-3 px-3">
        <Link
          to={`/donations/${donation._id}`}
          className="btn btn-outline-primary btn-sm w-100 fw-semibold"
          id={`view-donation-${donation._id}`}
        >
          View Details & Track <i className="bi bi-arrow-right ms-1"></i>
        </Link>
      </div>
    </div>
  );
}
