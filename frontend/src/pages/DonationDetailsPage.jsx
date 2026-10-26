import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import Timeline from '../components/donation/Timeline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';

export default function DonationDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [donation, setDonation] = useState(null);
  const [history, setHistory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/donations/${id}`);
      if (res.data.success) {
        setDonation(res.data.donation);
        setHistory(res.data.history);
        setRequests(res.data.requests);
        setPickup(res.data.pickup);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load donation details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Donor accepts a request
  const handleAcceptRequest = async (requestId) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/requests/${requestId}/accept`, {
        responseNotes: 'Request accepted by donor. Ready for volunteer pickup.',
      });
      if (res.data.success) {
        setSuccessMsg('Request accepted! Now volunteers can claim this pickup.');
        fetchDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setActionLoading(false);
    }
  };

  // Volunteer accepts pickup
  const handleClaimPickup = async () => {
    try {
      setActionLoading(true);
      const res = await api.post('/pickups', { donationId: donation._id });
      if (res.data.success) {
        setSuccessMsg('You have accepted this pickup task!');
        fetchDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept pickup.');
    } finally {
      setActionLoading(false);
    }
  };

  // Volunteer updates checkpoint
  const handleUpdatePickupCheckpoint = async (newStatus) => {
    if (!pickup) return;
    try {
      setActionLoading(true);
      const notes = prompt(`Enter notes for marking as ${newStatus}:`) || '';
      const res = await api.patch(`/pickups/${pickup._id}/status`, {
        status: newStatus,
        notes,
      });
      if (res.data.success) {
        setSuccessMsg(`Status updated to ${newStatus}!`);
        fetchDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  // NGO confirms receipt
  const handleConfirmReceipt = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/donations/${donation._id}/receive`);
      if (res.data.success) {
        setSuccessMsg('Receipt confirmed! Food is safely in NGO hands.');
        fetchDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm receipt.');
    } finally {
      setActionLoading(false);
    }
  };

  // NGO records distribution
  const handleRecordDistribution = async () => {
    const served = prompt('Enter number of people/meals served:', donation.quantity);
    if (!served) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/donations/${donation._id}/distribute`, {
        peopleServed: Number(served),
        notes: 'Distributed to community members.',
      });
      if (res.data.success) {
        setSuccessMsg(`Food distribution completed! Served ${served} people.`);
        fetchDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record distribution.');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel donation (Donor/Admin)
  const handleCancelDonation = async () => {
    if (!window.confirm('Are you sure you want to cancel this donation?')) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/donations/${donation._id}/cancel`, {
        reason: 'Cancelled by user from details page',
      });
      if (res.data.success) {
        setSuccessMsg('Donation has been cancelled.');
        fetchDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel donation.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading donation details..." fullPage />;

  if (!donation) {
    return (
      <div className="container py-5 text-center">
        <h3 className="fw-bold">Donation Not Found</h3>
        <p className="text-muted">The requested food listing does not exist or has been removed.</p>
        <Link to="/donations" className="btn btn-primary mt-2">
          Back to Listings
        </Link>
      </div>
    );
  }

  const isDonorOwner = user && (user._id === donation.donor?._id || user.role === 'admin');
  const isVolunteer = user && (user.role === 'volunteer' || user.role === 'admin');
  const isNgo = user && (user.role === 'ngo' || user.role === 'admin');
  const isAssignedVolunteer = user && pickup && pickup.volunteer?._id === user._id;

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/donations" className="text-decoration-none">Donations</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{donation.foodName}</li>
        </ol>
      </nav>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      <div className="row g-4">
        {/* Main Details Column */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
            {/* Header Image */}
            {donation.imageUrl && (
              <div style={{ maxHeight: '340px', overflow: 'hidden' }}>
                <img
                  src={donation.imageUrl}
                  alt={donation.foodName}
                  className="w-100 object-fit-cover"
                  style={{ height: '300px' }}
                />
              </div>
            )}

            <div className="p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <StatusBadge status={donation.status} />
                    <span className="badge-category text-uppercase">{donation.category?.replace('_', ' ')}</span>
                    {donation.isVegetarian ? (
                      <span className="badge bg-success-subtle text-success border border-success fw-bold">
                        VEG
                      </span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger border border-danger fw-bold">
                        NON-VEG
                      </span>
                    )}
                  </div>
                  <h2 className="fw-bold text-dark mb-1">{donation.foodName}</h2>
                  <div className="text-muted small">Listed on {new Date(donation.createdAt).toLocaleString()}</div>
                </div>

                <div className="text-end">
                  <div className="badge bg-success fs-5 px-3 py-2">
                    {donation.quantity} {donation.unit}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 mb-4">
                <h6 className="fw-bold mb-2">Description & Hygiene Context</h6>
                <p className="text-secondary small mb-0" style={{ whiteSpace: 'pre-line' }}>
                  {donation.description}
                </p>
              </div>

              {/* Food Specifications Grid */}
              <div className="row g-3 mb-4">
                <div className="col-sm-6">
                  <div className="p-3 border rounded-3 h-100">
                    <span className="text-muted small d-block">Preparation Time</span>
                    <strong className="text-dark small">
                      <i className="bi bi-calendar-event me-1 text-primary"></i>
                      {new Date(donation.preparationDate).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="p-3 border rounded-3 h-100">
                    <span className="text-muted small d-block">Use-by Expiration</span>
                    <strong className="text-danger small">
                      <i className="bi bi-clock-history me-1"></i>
                      {new Date(donation.useByDate).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="p-3 border rounded-3 h-100">
                    <span className="text-muted small d-block">Storage Condition</span>
                    <strong className="text-dark small text-capitalize">
                      <i className="bi bi-snow me-1 text-info"></i>
                      {donation.storageConditions?.replace('_', ' ')}
                    </strong>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="p-3 border rounded-3 h-100">
                    <span className="text-muted small d-block">Community Impact</span>
                    <strong className="text-success small">
                      <i className="bi bi-heart-fill me-1"></i>
                      {donation.peopleServed > 0
                        ? `${donation.peopleServed} People Fed`
                        : `${donation.quantity} Potential Servings`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Pickup Location Info */}
              <div className="p-3 bg-white border rounded-3 mb-4">
                <h6 className="fw-bold text-dark mb-2">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i> Pickup & Donor Details
                </h6>
                <p className="small text-secondary mb-1">
                  <strong>Location:</strong> {donation.pickupAddress}
                </p>
                <p className="small text-secondary mb-0">
                  <strong>Donor Name:</strong> {donation.donor?.name || 'Grand Palace'} •{' '}
                  <strong>Contact:</strong> {donation.pickupContactPhone || donation.donor?.phone}
                </p>
              </div>

              {/* Contextual Action Bar */}
              <div className="p-3 bg-light rounded-3 d-flex flex-wrap gap-2 justify-content-between align-items-center">
                <span className="fw-bold small text-secondary">Available Actions:</span>

                <div className="d-flex flex-wrap gap-2">
                  {/* NGO Request */}
                  {isNgo && donation.status === 'AVAILABLE' && (
                    <Link to="/ngo/dashboard" className="btn btn-success fw-bold shadow-sm" id="details-request-btn">
                      <i className="bi bi-hand-thumbs-up me-1"></i> Request from NGO Dashboard
                    </Link>
                  )}

                  {/* Volunteer Claim Pickup */}
                  {isVolunteer && donation.status === 'ACCEPTED' && !donation.assignedVolunteer && (
                    <button
                      className="btn btn-primary fw-bold shadow-sm"
                      onClick={handleClaimPickup}
                      disabled={actionLoading}
                      id="details-claim-pickup-btn"
                    >
                      <i className="bi bi-bicycle me-1"></i> Accept Pickup Task
                    </button>
                  )}

                  {/* Volunteer Checkpoints */}
                  {isAssignedVolunteer && donation.status === 'PICKUP_ASSIGNED' && (
                    <button
                      className="btn btn-warning fw-bold"
                      onClick={() => handleUpdatePickupCheckpoint('PICKED_UP')}
                      disabled={actionLoading}
                    >
                      <i className="bi bi-box-arrow-in-down me-1"></i> Mark Picked Up
                    </button>
                  )}

                  {isAssignedVolunteer && donation.status === 'PICKED_UP' && (
                    <button
                      className="btn btn-success fw-bold"
                      onClick={() => handleUpdatePickupCheckpoint('DELIVERED')}
                      disabled={actionLoading}
                    >
                      <i className="bi bi-check2-circle me-1"></i> Mark Delivered
                    </button>
                  )}

                  {/* NGO Confirm Receipt */}
                  {isNgo && donation.status === 'DELIVERED' && (
                    <button
                      className="btn btn-primary fw-bold"
                      onClick={handleConfirmReceipt}
                      disabled={actionLoading}
                    >
                      <i className="bi bi-box-seam me-1"></i> Confirm Receipt
                    </button>
                  )}

                  {/* NGO Record Distribution */}
                  {isNgo && ['RECEIVED', 'DELIVERED'].includes(donation.status) && (
                    <button
                      className="btn btn-success fw-bold"
                      onClick={handleRecordDistribution}
                      disabled={actionLoading}
                    >
                      <i className="bi bi-heart-fill me-1"></i> Record Distribution
                    </button>
                  )}

                  {/* Donor Cancel */}
                  {isDonorOwner && ['AVAILABLE', 'REQUESTED'].includes(donation.status) && (
                    <button
                      className="btn btn-outline-danger"
                      onClick={handleCancelDonation}
                      disabled={actionLoading}
                    >
                      <i className="bi bi-x-circle me-1"></i> Cancel Listing
                    </button>
                  )}
                </div>
              </div>

              {/* Pending Requests for Donor */}
              {isDonorOwner && requests.length > 0 && donation.status === 'REQUESTED' && (
                <div className="mt-4 p-3 border rounded-3 bg-white">
                  <h6 className="fw-bold text-primary mb-3">
                    <i className="bi bi-envelope-paper me-1"></i> Incoming NGO Requests
                  </h6>
                  {requests.map((r) => (
                    <div key={r._id} className="d-flex justify-content-between align-items-center p-2 border-bottom">
                      <div>
                        <strong>{r.ngo?.name}</strong> requested {r.requestedQuantity} {donation.unit}
                        <div className="text-muted small">{r.notes}</div>
                      </div>
                      {r.status === 'PENDING' && (
                        <button
                          className="btn btn-success btn-sm fw-bold"
                          onClick={() => handleAcceptRequest(r._id)}
                          disabled={actionLoading}
                          id={`accept-req-${r._id}`}
                        >
                          Accept Request
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Lifecycle Timeline */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4 p-4 sticky-top" style={{ top: '80px' }}>
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-shield-check text-success me-1"></i> Lifecycle Audit
              </h5>
              <span className="badge bg-light text-secondary border small">Verified Log</span>
            </div>
            <p className="text-muted small">
              Every status checkpoint is recorded with actor ID and timestamp for chain-of-custody transparency.
            </p>

            <Timeline history={history} />
          </div>
        </div>
      </div>
    </div>
  );
}
