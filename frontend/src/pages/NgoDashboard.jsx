import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DonationCard from '../components/donation/DonationCard';
import DonationFilter from '../components/donation/DonationFilter';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import EmptyState from '../components/common/EmptyState';

export default function NgoDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my-requests' | 'deliveries'

  // Available Donations
  const [availableDonations, setAvailableDonations] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', status: 'AVAILABLE' });
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // My Requests
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Active / Received Deliveries
  const [deliveries, setDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  // Modals & Feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Request Modal
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestQty, setRequestQty] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Distribution Modal
  const [distributeDonation, setDistributeDonation] = useState(null);
  const [peopleServed, setPeopleServed] = useState('');
  const [distributionNotes, setDistributionNotes] = useState('');
  const [submittingDistribution, setSubmittingDistribution] = useState(false);

  const fetchAvailable = useCallback(async () => {
    try {
      setLoadingAvailable(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);

      const res = await api.get(`/donations?${queryParams.toString()}`);
      if (res.data.success) {
        setAvailableDonations(res.data.donations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAvailable(false);
    }
  }, [filters]);

  const fetchMyRequests = useCallback(async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get('/requests/my');
      if (res.data.success) {
        setMyRequests(res.data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoadingDeliveries(true);
      // Donations where requestedBy is this NGO
      const res = await api.get('/donations');
      if (res.data.success) {
        const ngoDonations = res.data.donations.filter(
          (d) =>
            d.requestedBy &&
            d.requestedBy._id === user._id &&
            ['ACCEPTED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'DELIVERED', 'RECEIVED', 'COMPLETED'].includes(d.status)
        );
        setDeliveries(ngoDonations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDeliveries(false);
    }
  }, [user._id]);

  useEffect(() => {
    if (activeTab === 'browse') fetchAvailable();
    if (activeTab === 'my-requests') fetchMyRequests();
    if (activeTab === 'deliveries') fetchDeliveries();
  }, [activeTab, fetchAvailable, fetchMyRequests, fetchDeliveries]);

  // Request Donation Submit
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;

    try {
      setSubmittingRequest(true);
      const res = await api.post(`/donations/${selectedDonation._id}/request`, {
        requestedQuantity: Number(requestQty) || selectedDonation.quantity,
        notes: requestNotes,
      });

      if (res.data.success) {
        setSuccessMsg(`Requested "${selectedDonation.foodName}" successfully! The donor has been notified.`);
        setSelectedDonation(null);
        fetchAvailable();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Cancel Request
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      const res = await api.patch(`/requests/${requestId}/cancel`);
      if (res.data.success) {
        setSuccessMsg('Request cancelled successfully.');
        fetchMyRequests();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel request.');
    }
  };

  // Confirm Receipt
  const handleConfirmReceipt = async (donationId) => {
    try {
      const res = await api.post(`/donations/${donationId}/receive`);
      if (res.data.success) {
        setSuccessMsg('Food receipt confirmed! You can now record distribution to record community impact.');
        fetchDeliveries();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm receipt.');
    }
  };

  // Record Distribution
  const handleDistributionSubmit = async (e) => {
    e.preventDefault();
    if (!distributeDonation) return;

    try {
      setSubmittingDistribution(true);
      const res = await api.post(`/donations/${distributeDonation._id}/distribute`, {
        peopleServed: Number(peopleServed),
        notes: distributionNotes,
      });

      if (res.data.success) {
        setSuccessMsg(`Distribution recorded! ${peopleServed} people fed. Food rescue completed.`);
        setDistributeDonation(null);
        fetchDeliveries();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record distribution.');
    } finally {
      setSubmittingDistribution(false);
    }
  };

  const isVerified = user.organization?.verificationStatus === 'verified';

  return (
    <div className="container py-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase px-2 py-1">
              NGO Relief Portal
            </span>
            {isVerified ? (
              <span className="badge bg-success-subtle text-success border border-success d-flex align-items-center gap-1">
                <i className="bi bi-patch-check-fill"></i> Verified Organization
              </span>
            ) : (
              <span className="badge bg-warning-subtle text-warning border border-warning d-flex align-items-center gap-1">
                <i className="bi bi-clock-history"></i> Verification Pending
              </span>
            )}
          </div>
          <h2 className="fw-bold text-dark mb-0">
            {user.organization?.organizationName || user.name}
          </h2>
          <p className="text-muted small mb-0">Request surplus food matches and record community feeding impact</p>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-3 border shadow-sm" id="ngo-dashboard-tabs">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
            id="tab-browse-available"
          >
            <i className="bi bi-search me-1"></i> Browse Available Food
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'my-requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-requests')}
            id="tab-my-requests"
          >
            <i className="bi bi-send me-1"></i> My Food Requests
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'deliveries' ? 'active' : ''}`}
            onClick={() => setActiveTab('deliveries')}
            id="tab-active-deliveries"
          >
            <i className="bi bi-truck me-1"></i> Active Deliveries & Impact
          </button>
        </li>
      </ul>

      {/* TAB 1: Browse Available Food */}
      {activeTab === 'browse' && (
        <div>
          <DonationFilter
            filters={filters}
            onFilterChange={(newFilters) => setFilters(newFilters)}
            onReset={() => setFilters({ search: '', category: '', status: 'AVAILABLE' })}
          />

          {loadingAvailable ? (
            <LoadingSpinner message="Searching available donations..." />
          ) : availableDonations.length === 0 ? (
            <EmptyState
              icon="bi-box"
              title="No food listings matching your criteria"
              description="Try adjusting your filters or check back later."
            />
          ) : (
            <div className="row g-4">
              {availableDonations.map((d) => (
                <div key={d._id} className="col-lg-4 col-md-6">
                  <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden d-flex flex-column">
                    <DonationCard donation={d} />
                    {d.status === 'AVAILABLE' && (
                      <div className="card-footer bg-light p-3 pt-0 border-0">
                        <button
                          className="btn btn-success w-100 fw-bold shadow-sm"
                          onClick={() => {
                            setSelectedDonation(d);
                            setRequestQty(d.quantity);
                          }}
                          id={`btn-request-${d._id}`}
                        >
                          <i className="bi bi-hand-thumbs-up me-1"></i> Request This Donation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Requests */}
      {activeTab === 'my-requests' && (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white p-3 border-bottom">
            <h5 className="fw-bold mb-0">My Submitted Requests</h5>
          </div>
          <div className="card-body p-0">
            {loadingRequests ? (
              <LoadingSpinner message="Loading your requests..." />
            ) : myRequests.length === 0 ? (
              <EmptyState
                icon="bi-envelope-paper"
                title="No requests made yet"
                description="Browse available donations to request food for your relief organization."
                actionText="Browse Available Food"
                onAction={() => setActiveTab('browse')}
              />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-secondary small">
                    <tr>
                      <th className="ps-4">Donation</th>
                      <th>Donor</th>
                      <th>Requested Quantity</th>
                      <th>Request Status</th>
                      <th>Date</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRequests.map((r) => (
                      <tr key={r._id}>
                        <td className="ps-4 py-3">
                          {r.donation ? (
                            <Link to={`/donations/${r.donation._id}`} className="fw-bold text-dark text-decoration-none">
                              {r.donation.foodName}
                            </Link>
                          ) : (
                            <span className="text-muted">Deleted listing</span>
                          )}
                        </td>
                        <td>{r.donation?.donor?.name || 'Donor'}</td>
                        <td>
                          <span className="fw-semibold">
                            {r.requestedQuantity} {r.donation?.unit}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              r.status === 'ACCEPTED'
                                ? 'bg-success'
                                : r.status === 'PENDING'
                                ? 'bg-warning text-dark'
                                : 'bg-secondary'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="small text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="text-end pe-4">
                          {r.status === 'PENDING' && (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleCancelRequest(r._id)}
                            >
                              Cancel Request
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Active Deliveries & Distribution Impact */}
      {activeTab === 'deliveries' && (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white p-3 border-bottom">
            <h5 className="fw-bold mb-0">Delivery Pipeline & Feeding Records</h5>
          </div>
          <div className="card-body p-0">
            {loadingDeliveries ? (
              <LoadingSpinner message="Loading deliveries..." />
            ) : deliveries.length === 0 ? (
              <EmptyState
                icon="bi-truck"
                title="No active deliveries"
                description="Once a donor accepts your request, the donation progress will appear here."
              />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-secondary small">
                    <tr>
                      <th className="ps-4">Food Item</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th>Volunteer Driver</th>
                      <th>People Fed</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((d) => (
                      <tr key={d._id}>
                        <td className="ps-4 py-3">
                          <Link to={`/donations/${d._id}`} className="fw-bold text-dark text-decoration-none">
                            {d.foodName}
                          </Link>
                          <div className="text-muted small">{d.pickupAddress}</div>
                        </td>
                        <td className="fw-semibold">
                          {d.quantity} {d.unit}
                        </td>
                        <td>
                          <StatusBadge status={d.status} />
                        </td>
                        <td>
                          {d.assignedVolunteer ? (
                            <span className="small">
                              <i className="bi bi-person-fill text-success me-1"></i>
                              {d.assignedVolunteer.name} ({d.assignedVolunteer.phone})
                            </span>
                          ) : (
                            <span className="text-muted small fst-italic">Awaiting volunteer pickup</span>
                          )}
                        </td>
                        <td>
                          {d.peopleServed > 0 ? (
                            <span className="badge bg-success-subtle text-success fw-bold">
                              {d.peopleServed} People Fed
                            </span>
                          ) : (
                            <span className="text-muted small">Not recorded</span>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          {/* NGO Actions based on status */}
                          {d.status === 'DELIVERED' && (
                            <button
                              className="btn btn-primary btn-sm me-1 fw-semibold"
                              onClick={() => handleConfirmReceipt(d._id)}
                              id={`btn-confirm-receipt-${d._id}`}
                            >
                              <i className="bi bi-box-seam me-1"></i> Confirm Receipt
                            </button>
                          )}

                          {['RECEIVED', 'DELIVERED'].includes(d.status) && (
                            <button
                              className="btn btn-success btn-sm fw-semibold"
                              onClick={() => {
                                setDistributeDonation(d);
                                setPeopleServed(d.quantity);
                              }}
                              id={`btn-record-dist-${d._id}`}
                            >
                              <i className="bi bi-heart-fill me-1"></i> Record Distribution
                            </button>
                          )}

                          <Link to={`/donations/${d._id}`} className="btn btn-outline-secondary btn-sm ms-1">
                            Track
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Modal */}
      {selectedDonation && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold">Request Food Donation</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedDonation(null)}></button>
              </div>
              <form onSubmit={handleRequestSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="text-muted small">Food Item</label>
                    <div className="fw-bold fs-5 text-dark">{selectedDonation.foodName}</div>
                    <div className="text-success small fw-semibold">
                      Total Available: {selectedDonation.quantity} {selectedDonation.unit}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Quantity Needed *</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedDonation.quantity}
                      className="form-control"
                      value={requestQty}
                      onChange={(e) => setRequestQty(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Message / Relief Distribution Purpose</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="e.g. For tonight's shelter dinner distribution..."
                      value={requestNotes}
                      onChange={(e) => setRequestNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setSelectedDonation(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold" disabled={submittingRequest} id="submit-request-modal-btn">
                    {submittingRequest ? 'Submitting...' : 'Confirm Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Record Distribution Impact Modal */}
      {distributeDonation && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-success">
                  <i className="bi bi-heart-fill me-1"></i> Record Food Distribution
                </h5>
                <button type="button" className="btn-close" onClick={() => setDistributeDonation(null)}></button>
              </div>
              <form onSubmit={handleDistributionSubmit}>
                <div className="modal-body p-4">
                  <p className="text-muted small">
                    Record genuine impact metrics for <strong>{distributeDonation.foodName}</strong>. This completes the donation lifecycle.
                  </p>

                  <div className="mb-3">
                    <label className="form-label">Number of People Served / Meals Distributed *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={peopleServed}
                      onChange={(e) => setPeopleServed(e.target.value)}
                      placeholder="e.g. 50"
                      required
                      id="input-people-served"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Distribution Notes</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="e.g. Distributed to community shelter families and children."
                      value={distributionNotes}
                      onChange={(e) => setDistributionNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setDistributeDonation(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success fw-bold" disabled={submittingDistribution} id="submit-distribution-btn">
                    {submittingDistribution ? 'Saving Impact...' : 'Save & Mark Completed'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
