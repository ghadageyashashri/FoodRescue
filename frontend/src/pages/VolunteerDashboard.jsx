import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import EmptyState from '../components/common/EmptyState';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'my-tasks'

  const [availableTasks, setAvailableTasks] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [pickupNotesModal, setPickupNotesModal] = useState({
    isOpen: false,
    pickupId: null,
    newStatus: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [availRes, myRes] = await Promise.all([
        api.get('/pickups/available'),
        api.get('/pickups/my'),
      ]);

      if (availRes.data.success) {
        setAvailableTasks(availRes.data.availableDonations);
      }
      if (myRes.data.success) {
        setMyPickups(myRes.data.pickups);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch volunteer tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Accept available pickup task
  const handleAcceptTask = async (donationId) => {
    try {
      const res = await api.post('/pickups', { donationId });
      if (res.data.success) {
        setSuccessMsg('Pickup task claimed! It is now listed under your active tasks.');
        setActiveTab('my-tasks');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim task.');
    }
  };

  // Open status modal
  const openStatusUpdate = (pickupId, newStatus) => {
    setPickupNotesModal({
      isOpen: true,
      pickupId,
      newStatus,
      notes: '',
    });
  };

  // Submit status update
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    const { pickupId, newStatus, notes } = pickupNotesModal;
    try {
      const res = await api.patch(`/pickups/${pickupId}/status`, {
        status: newStatus,
        notes,
      });

      if (res.data.success) {
        setSuccessMsg(`Status updated to ${newStatus}!`);
        setPickupNotesModal({ isOpen: false, pickupId: null, newStatus: '', notes: '' });
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  const activePickups = myPickups.filter((p) => ['ASSIGNED', 'PICKED_UP'].includes(p.status));
  const completedPickups = myPickups.filter((p) => p.status === 'DELIVERED');

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <span className="badge bg-warning-subtle text-warning-emphasis fw-bold text-uppercase px-2 py-1 mb-1">
            Volunteer Logistics Hub
          </span>
          <h2 className="fw-bold text-dark mb-0">Driver: {user.name}</h2>
          <p className="text-muted small mb-0">Pick up accepted food surplus and safely deliver to NGO destinations</p>
        </div>
        <div className="mt-3 mt-md-0 d-flex gap-2">
          <span className="badge bg-success-subtle text-success p-2 px-3 border border-success fw-bold">
            <i className="bi bi-bicycle me-1"></i> Active Driver
          </span>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {/* Navigation Tabs */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-3 border shadow-sm" id="volunteer-tabs">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
            id="tab-available-pickups"
          >
            <i className="bi bi-geo-alt me-1"></i> Available Deliveries ({availableTasks.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'my-tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-tasks')}
            id="tab-my-pickups"
          >
            <i className="bi bi-box-seam me-1"></i> My Active Tasks ({activePickups.length})
          </button>
        </li>
      </ul>

      {/* TAB 1: Available Deliveries */}
      {activeTab === 'available' && (
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white p-3 border-bottom">
            <h5 className="fw-bold mb-0">Surplus Food Ready for Transport</h5>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <LoadingSpinner message="Searching available pickup assignments..." />
            ) : availableTasks.length === 0 ? (
              <EmptyState
                icon="bi-check-circle"
                title="No deliveries awaiting drivers"
                description="All current donations have drivers assigned or are awaiting NGO match."
              />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-secondary small">
                    <tr>
                      <th className="ps-4">Food Item</th>
                      <th>Quantity</th>
                      <th>Pickup From (Donor)</th>
                      <th>Deliver To (NGO)</th>
                      <th>Use By</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableTasks.map((t) => (
                      <tr key={t._id}>
                        <td className="ps-4 py-3">
                          <Link to={`/donations/${t._id}`} className="fw-bold text-dark text-decoration-none">
                            {t.foodName}
                          </Link>
                        </td>
                        <td>
                          <span className="fw-semibold text-success">
                            {t.quantity} {t.unit}
                          </span>
                        </td>
                        <td>
                          <div className="fw-bold small">{t.donor?.name}</div>
                          <div className="text-muted small text-truncate" style={{ maxWidth: '220px' }}>
                            <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                            {t.pickupAddress}
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold small text-primary">{t.requestedBy?.name || 'NGO'}</div>
                          <div className="text-muted small">{t.requestedBy?.phone}</div>
                        </td>
                        <td className="small text-muted">
                          {new Date(t.useByDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="text-end pe-4">
                          <button
                            className="btn btn-primary btn-sm fw-bold shadow-sm"
                            onClick={() => handleAcceptTask(t._id)}
                            id={`btn-accept-pickup-${t._id}`}
                          >
                            <i className="bi bi-check-lg me-1"></i> Accept Task
                          </button>
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

      {/* TAB 2: My Active Deliveries */}
      {activeTab === 'my-tasks' && (
        <div className="row g-4">
          <div className="col-12">
            <h5 className="fw-bold text-dark mb-3">Active Delivery Missions</h5>
            {loading ? (
              <LoadingSpinner message="Loading your assigned tasks..." />
            ) : activePickups.length === 0 ? (
              <EmptyState
                icon="bi-bicycle"
                title="No active delivery in progress"
                description="Accept an available delivery from the first tab to begin."
                actionText="View Available Deliveries"
                onAction={() => setActiveTab('available')}
              />
            ) : (
              <div className="row g-3">
                {activePickups.map((p) => (
                  <div key={p._id} className="col-lg-6">
                    <div className="card shadow-sm border-0 rounded-4 p-4 h-100">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <StatusBadge status={p.status} />
                          <h5 className="fw-bold text-dark mt-2 mb-1">
                            {p.donation?.foodName}
                          </h5>
                          <span className="badge bg-success-subtle text-success fw-bold">
                            {p.donation?.quantity} {p.donation?.unit}
                          </span>
                        </div>
                        <Link to={`/donations/${p.donation?._id}`} className="btn btn-outline-secondary btn-sm">
                          Track Details
                        </Link>
                      </div>

                      {/* Route Box */}
                      <div className="p-3 bg-light rounded-3 mb-3 border">
                        <div className="mb-2">
                          <span className="text-muted small d-block">1. PICKUP POINT (Donor)</span>
                          <strong className="text-dark">{p.donation?.donor?.name}</strong>
                          <div className="small text-secondary">
                            <i className="bi bi-geo-alt text-danger me-1"></i>
                            {p.pickupAddress}
                          </div>
                          <div className="small text-muted">Phone: {p.donation?.donor?.phone}</div>
                        </div>

                        <hr className="my-2" />

                        <div>
                          <span className="text-muted small d-block">2. DELIVERY DESTINATION (NGO)</span>
                          <strong className="text-primary">{p.ngo?.name || 'Assigned Relief NGO'}</strong>
                          <div className="small text-secondary">
                            <i className="bi bi-flag-fill text-success me-1"></i>
                            {p.deliveryAddress}
                          </div>
                          <div className="small text-muted">Phone: {p.ngo?.phone}</div>
                        </div>
                      </div>

                      {/* Status Action Buttons */}
                      <div className="mt-auto d-flex gap-2">
                        {p.status === 'ASSIGNED' && (
                          <button
                            className="btn btn-warning w-100 fw-bold shadow-sm"
                            onClick={() => openStatusUpdate(p._id, 'PICKED_UP')}
                            id={`btn-mark-picked-${p._id}`}
                          >
                            <i className="bi bi-box-arrow-in-down me-1"></i> Confirm Food Picked Up
                          </button>
                        )}

                        {p.status === 'PICKED_UP' && (
                          <button
                            className="btn btn-success w-100 fw-bold shadow-sm"
                            onClick={() => openStatusUpdate(p._id, 'DELIVERED')}
                            id={`btn-mark-delivered-${p._id}`}
                          >
                            <i className="bi bi-check2-circle me-1"></i> Confirm Delivered to NGO
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Completed Tasks */}
          {completedPickups.length > 0 && (
            <div className="col-12 mt-4">
              <h5 className="fw-bold text-dark mb-3">Completed Rescue Missions</h5>
              <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th className="ps-4">Food Rescued</th>
                        <th>Delivered To</th>
                        <th>Delivered At</th>
                        <th className="text-end pe-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedPickups.map((cp) => (
                        <tr key={cp._id}>
                          <td className="ps-4 fw-semibold">{cp.donation?.foodName}</td>
                          <td>{cp.ngo?.name || 'Relief NGO'}</td>
                          <td className="small text-muted">
                            {cp.deliveredAt ? new Date(cp.deliveredAt).toLocaleString() : 'Recently'}
                          </td>
                          <td className="text-end pe-4">
                            <span className="badge bg-success-subtle text-success border border-success">
                              Delivered
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Update Notes Modal */}
      {pickupNotesModal.isOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold">
                  Update Task Status: <span className="text-primary">{pickupNotesModal.newStatus}</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setPickupNotesModal({ isOpen: false, pickupId: null, newStatus: '', notes: '' })}
                ></button>
              </div>
              <form onSubmit={handleStatusSubmit}>
                <div className="modal-body p-4">
                  <p className="text-muted small">
                    Confirming this checkpoint will immediately update the donor, NGO, and platform timeline.
                  </p>
                  <div className="mb-3">
                    <label className="form-label">Checkpoint Notes / Observations (Optional)</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="e.g. Food thermobox securely loaded in vehicle / Handed over to kitchen manager"
                      value={pickupNotesModal.notes}
                      onChange={(e) => setPickupNotesModal((prev) => ({ ...prev, notes: e.target.value }))}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setPickupNotesModal({ isOpen: false, pickupId: null, newStatus: '', notes: '' })}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold" id="confirm-task-status-btn">
                    Confirm Checkpoint
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
