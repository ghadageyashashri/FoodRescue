import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="pt-5 pb-4 mt-auto border-top">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="fs-3">🍲</span>
              <span className="brand-font fs-4 fw-bold text-white">FoodRescue</span>
            </div>
            <p className="text-light small pe-lg-4" style={{ opacity: 0.85 }}>
              Intelligent Food Waste Reduction & Donation Platform connecting food businesses, event caterers, and canteens directly with verified NGOs and volunteer logistics.
            </p>
            <div className="d-flex gap-3 mt-3">
              <span className="badge bg-success-subtle text-success border border-success-subtle">MERN Stack</span>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle">MongoDB Atlas / Local</span>
              <span className="badge bg-warning-subtle text-warning border border-warning-subtle">REST API v1</span>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-bold mb-3">Navigation</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/" className="text-decoration-none text-light" style={{ opacity: 0.8 }}>Home</Link></li>
              <li><Link to="/donations" className="text-decoration-none text-light" style={{ opacity: 0.8 }}>Available Food</Link></li>
              <li><Link to="/impact" className="text-decoration-none text-light" style={{ opacity: 0.8 }}>Impact Analytics</Link></li>
              <li><Link to="/login" className="text-decoration-none text-light" style={{ opacity: 0.8 }}>Sign In</Link></li>
              <li><Link to="/register" className="text-decoration-none text-light" style={{ opacity: 0.8 }}>Register Account</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">User Portals</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/donor/dashboard" className="text-decoration-none text-light" style={{ opacity: 0.8 }}>Donor Dashboard</Link></li>
              <li><Link to="/ngo/dashboard" className="text-decoration-none text-light" style={{ opacity: 0.8 }}>NGO Relief Portal</Link></li>
              <li><Link to="/volunteer/dashboard" className="text-decoration-none text-light" style={{ opacity: 0.8 }}>Volunteer Logistics</Link></li>
              <li><Link to="/admin/dashboard" className="text-decoration-none text-light" style={{ opacity: 0.8 }}>Administrator Control</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Demonstration Ready</h6>
            <p className="text-light small mb-2" style={{ opacity: 0.85 }}>
              Built for college examination & syllabus demonstration with complete real-time lifecycle tracking.
            </p>
            <div className="p-2 rounded bg-dark border border-secondary text-secondary small">
              <i className="bi bi-shield-check text-success me-1"></i>
              <span>JWT & Role-based Access Control Enforced</span>
            </div>
          </div>
        </div>

        <hr className="my-4 border-secondary" style={{ opacity: 0.3 }} />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-light small" style={{ opacity: 0.7 }}>
          <div>© {new Date().getFullYear()} FoodRescue Platform. Web Technology Project.</div>
          <div className="mt-2 mt-md-0">
            Node.js • Express.js • MongoDB • ReactJS • Bootstrap 5
          </div>
        </div>
      </div>
    </footer>
  );
}
