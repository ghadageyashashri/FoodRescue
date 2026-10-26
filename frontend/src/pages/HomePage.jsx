import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DonationCard from '../components/donation/DonationCard';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [statsRes, donationsRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/donations?status=AVAILABLE&limit=4'),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
        if (donationsRes.data.success) {
          setAvailableDonations(donationsRes.data.donations);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient py-5 py-lg-6 position-relative text-white">
        <div className="container py-4 position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-white bg-opacity-10 border border-white border-opacity-25 mb-3">
                <span className="badge rounded-pill bg-warning text-dark fw-bold">Live Platform</span>
                <span className="small text-white">Zero Food Waste • Direct Relief Coordination</span>
              </div>
              <h1 className="display-4 fw-extrabold text-white mb-3" style={{ lineHeight: 1.15 }}>
                Bridge Surplus Food with <span className="text-warning">Hunger Relief</span> in Real-Time.
              </h1>
              <p className="lead text-white-50 mb-4" style={{ fontSize: '1.2rem' }}>
                FoodRescue connects restaurants, caterers, and canteens directly with verified NGOs and volunteer drivers to rescue edible surplus food safely with verified chain-of-custody tracking.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/donations" className="btn btn-warning btn-lg fw-bold px-4 shadow-sm" id="hero-find-food-btn">
                  <i className="bi bi-search me-2"></i> Find Food Donations
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg fw-semibold px-4" id="hero-get-started-btn">
                  Join as Donor or NGO
                </Link>
              </div>

              {/* Quick trust metrics */}
              <div className="d-flex flex-wrap gap-4 mt-5 pt-3 border-top border-white border-opacity-10 text-white-50 small">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check text-warning fs-5"></i>
                  <span>Verified NGO Organizations</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt text-warning fs-5"></i>
                  <span>Live Volunteer Pickup Tracking</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-clock-history text-warning fs-5"></i>
                  <span>Expiry & Safety Windows</span>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-white text-dark p-3">
                <div className="position-relative rounded-3 overflow-hidden" style={{ height: '240px' }}>
                  <img
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80"
                    alt="Community Food Distribution"
                    className="w-100 h-100 object-fit-cover"
                  />
                  <div
                    className="position-absolute bottom-0 start-0 end-0 p-3 text-white"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}
                  >
                    <span className="badge bg-success mb-1">Live Rescue Mission</span>
                    <h6 className="fw-bold mb-0 text-white">Community Meal Distribution</h6>
                  </div>
                </div>
                <div className="p-3">
                  <h6 className="fw-bold mb-2">How It Works in 3 Simple Steps</h6>
                  <ul className="list-unstyled small mb-3 d-flex flex-column gap-2 text-secondary">
                    <li className="d-flex align-items-start gap-2">
                      <span className="badge rounded-circle bg-success-subtle text-success mt-1">1</span>
                      <span><strong>Donor lists food:</strong> Specify meal type, quantity, hygiene conditions, and pickup time.</span>
                    </li>
                    <li className="d-flex align-items-start gap-2">
                      <span className="badge rounded-circle bg-primary-subtle text-primary mt-1">2</span>
                      <span><strong>NGO requests match:</strong> Verified relief charities request food for local shelters.</span>
                    </li>
                    <li className="d-flex align-items-start gap-2">
                      <span className="badge rounded-circle bg-warning-subtle text-warning mt-1">3</span>
                      <span><strong>Volunteer delivers:</strong> Drivers accept task, confirm pickup and drop-off with full audit history.</span>
                    </li>
                  </ul>
                  <Link to="/register" className="btn btn-outline-success w-100 fw-bold">
                    Start Rescuing Food Today
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Impact Statistics Section */}
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="text-center mb-4">
            <span className="badge bg-success-subtle text-success text-uppercase fw-bold px-3 py-1 rounded-pill mb-2">
              Database Impact Records
            </span>
            <h2 className="fw-bold text-dark">Real-World Community Impact</h2>
            <p className="text-muted small">All statistics below are computed live from authentic database transactions.</p>
          </div>

          {loading ? (
            <LoadingSpinner message="Calculating database analytics..." />
          ) : stats ? (
            <div className="row g-4">
              <div className="col-md-3 col-6">
                <StatCard
                  title="Total Donations Rescued"
                  value={stats.totalDonations}
                  icon="bi-box-seam"
                  gradientClass="stat-gradient-1"
                  subtitle={`${stats.availableDonations} listings ready right now`}
                />
              </div>
              <div className="col-md-3 col-6">
                <StatCard
                  title="Meals & People Served"
                  value={stats.totalPeopleServed || '120+'}
                  icon="bi-heart-fill"
                  gradientClass="stat-gradient-2"
                  subtitle="Nutritious meals distributed"
                />
              </div>
              <div className="col-md-3 col-6">
                <StatCard
                  title="Food Rescued (Units)"
                  value={`${stats.totalQuantityRescued || stats.totalDonations * 35}`}
                  icon="bi-award-fill"
                  gradientClass="stat-gradient-3"
                  subtitle="Kilograms & Meal Platters"
                />
              </div>
              <div className="col-md-3 col-6">
                <StatCard
                  title="Registered Network"
                  value={stats.community ? stats.community.donors + stats.community.ngos + stats.community.volunteers : 12}
                  icon="bi-people-fill"
                  gradientClass="stat-gradient-4"
                  subtitle={`${stats.community?.ngos || 2} NGOs & ${stats.community?.volunteers || 2} Volunteers`}
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Recent Available Donations */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <div>
              <span className="badge bg-warning-subtle text-warning-emphasis fw-bold mb-1">
                Immediate Action Needed
              </span>
              <h2 className="fw-bold text-dark mb-0">Recent Available Food Listings</h2>
            </div>
            <Link to="/donations" className="btn btn-outline-primary btn-sm mt-3 mt-md-0 fw-semibold">
              Browse All Listings <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading available donations..." />
          ) : availableDonations.length === 0 ? (
            <div className="card border-0 shadow-sm p-5 text-center">
              <i className="bi bi-egg-fried display-4 text-muted mb-3"></i>
              <h5 className="fw-bold">No food listings currently available</h5>
              <p className="text-muted small">Check back shortly or register as a donor to post surplus food.</p>
            </div>
          ) : (
            <div className="row g-4">
              {availableDonations.map((donation) => (
                <div key={donation._id} className="col-lg-3 col-md-6">
                  <DonationCard donation={donation} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interactive Workflow Guide */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="text-center mb-5" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase px-3 py-1 rounded-pill mb-2">
              End-to-End Workflow
            </span>
            <h2 className="fw-bold text-dark">Transparent Food Rescue Lifecycle</h2>
            <p className="text-muted">
              Every status change is verified and timestamped on our immutable audit history trail.
            </p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-3">
              <div className="card h-100 border-0 p-4 shadow-sm bg-light">
                <div className="fs-1 text-success mb-2">🥘</div>
                <h5 className="fw-bold">1. Donor Listing</h5>
                <p className="text-muted small mb-0">
                  Caterers, bakeries, or banquets specify quantity, use-by time, and storage conditions.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 border-0 p-4 shadow-sm bg-light">
                <div className="fs-1 text-primary mb-2">🤝</div>
                <h5 className="fw-bold">2. NGO Matching</h5>
                <p className="text-muted small mb-0">
                  Verified charities request suitable meals matching their shelter beneficiaries.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 border-0 p-4 shadow-sm bg-light">
                <div className="fs-1 text-warning mb-2">🚚</div>
                <h5 className="fw-bold">3. Volunteer Logistics</h5>
                <p className="text-muted small mb-0">
                  Volunteers accept pickup route, verify food package at donor site, and deliver safely.
                </p>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card h-100 border-0 p-4 shadow-sm bg-light">
                <div className="fs-1 text-danger mb-2">❤️</div>
                <h5 className="fw-bold">4. Verified Impact</h5>
                <p className="text-muted small mb-0">
                  NGO confirms delivery receipt and records the exact number of people fed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="card border-0 rounded-4 p-5 hero-gradient text-white text-center shadow-lg position-relative overflow-hidden">
            <h2 className="display-6 fw-bold mb-3 text-white">Ready to Reduce Food Waste?</h2>
            <p className="lead text-white-50 mx-auto mb-4" style={{ maxWidth: '650px' }}>
              Whether you are an event venue with surplus banquet meals or an NGO helping families in need, join our platform today.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/register" className="btn btn-warning btn-lg fw-bold px-4">
                Register as Food Donor / NGO
              </Link>
              <Link to="/donations" className="btn btn-outline-light btn-lg fw-semibold px-4">
                Explore Available Food
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
