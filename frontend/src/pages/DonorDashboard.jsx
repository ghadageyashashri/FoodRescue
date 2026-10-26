import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import EmptyState from '../components/common/EmptyState';
import DonationFormModal from '../components/donation/DonationFormModal';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);

  const fetchMyDonations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/donations?donor=${user._id}`);
      if (res.data.success) {
        setDonations(res.data.donations);
      }
    } catch (err) {
      setError('Failed to fetch your donations.');
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    fetchMyDonations();
  }, [fetchMyDonations]);

  // Statistics calculation
  const totalDonations = donations.length;
  const availableCount = donations.filter((d) => d.status === 'AVAILABLE').length;
  const inProgressCount = donations.filter((d) =>
    ['REQUESTED', 'ACCEPTED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'DELIVERED', 'RECEIVED'].includes(d.status)
  ).length;
  const completedCount = donations.filter((d) => ['COMPLETED', 'DISTRIBUTED'].includes(d.status)).length;

  const handleCreateOrUpdate = async (formData) => {
    if (editingDonation) {
      const res = await api.patch(`/donations/${editingDonation._id}`, formData);
      if (res.data.success) {
        setSuccessMsg('Donation updated successfully.');
        fetchMyDonations();
      }
    } else {
      const res = await api.post('/donations', formData);
      if (res.data.success) {
        setSuccessMsg('New food donation listed successfully!');
        fetchMyDonations();
      }
    }
  };

  const handleCancelDonation = async (id, foodName) => {
    if (!window.confirm(`Are you sure you want to cancel "${foodName}"?`)) return;
    try {
      const res = await api.post(`/donations/${id}/cancel`, { reason: 'Cancelled by donor from dashboard' });
      if (res.data.success) {
        setSuccessMsg(`Donation "${foodName}" has been cancelled.`);
        fetchMyDonations();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel donation.');
    }
  };

  const filteredDonations = statusFilter === 'ALL'
    ? donations
    : donations.filter((d) => d.status === statusFilter);

  return (
    <div className="container py-4">
      {/* Top Welcome Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <span className="badge bg-success-subtle text-success fw-bold text-uppercase px-2 py-1 mb-1">
            Food Donor Portal
          </span>
          <h2 className="fw-bold text-dark mb-0">Welcome, {user.name}</h2>
          <p className="text-muted small mb-0">Manage surplus food listings and review rescue progress</p>
        </div>

        <button
          className="btn btn-primary d-flex align-items-center gap-2 mt-3 mt-md-0 fw-semibold px-3 py-2 shadow-sm"
          onClick={() => {
            setEditingDonation(null);
            setIsModalOpen(true);
          }}
          id="btn-create-donation"
        >
          <i className="bi bi-plus-circle-fill"></i>
          <span>Create Food Listing</span>
        </button>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <StatCard
            title="Total Listed"
            value={totalDonations}
            icon="bi-basket-fill"
            gradientClass="stat-gradient-1"
            subtitle="All time donations"
          />
        </div>
        <div className="col-md-3 col-6">
          <StatCard
            title="Available Now"
            value={availableCount}
            icon="bi-check-circle-fill"
            gradientClass="stat-gradient-2"
            subtitle="Ready for NGO request"
          />
        </div>
        <div className="col-md-3 col-6">
          <StatCard
            title="In Transit / Active"
            value={inProgressCount}
            icon="bi-arrow-repeat"
            gradientClass="stat-gradient-3"
            subtitle="Being matched / delivered"
          />
        </div>
        <div className="col-md-3 col-6">
          <StatCard
            title="Rescued & Delivered"
            value={completedCount}
            icon="bi-trophy-fill"
            gradientClass="stat-gradient-4"
            subtitle="Safely fed communities"
          />
        </div>
      </div>

      {/* My Listings Card */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-header bg-white border-bottom p-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
          <h5 className="fw-bold mb-0">My Food Donations</h5>

          {/* Filter Pills */}
          <div className="btn-group btn-group-sm" role="group">
            {['ALL', 'AVAILABLE', 'REQUESTED', 'ACCEPTED', 'PICKUP_ASSIGNED', 'COMPLETED'].map((st) => (
              <button
                key={st}
                type="button"
                className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'ALL' ? 'All' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Loading your donations..." />
          ) : filteredDonations.length === 0 ? (
            <EmptyState
              icon="bi-basket"
              title="No donations found"
              description="You have not created any food listings in this category yet."
              actionText="Create Your First Donation"
              onAction={() => {
                setEditingDonation(null);
                setIsModalOpen(true);
              }}
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-secondary small">
                  <tr>
                    <th className="ps-4">Food Item</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Use By</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((d) => (
                    <tr key={d._id}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-2">
                          {d.isVegetarian ? (
                            <span className="badge bg-success-subtle text-success border border-success" title="Vegetarian">
                              VEG
                            </span>
                          ) : (
                            <span className="badge bg-danger-subtle text-danger border border-danger" title="Non-Vegetarian">
                              NON-VEG
                            </span>
                          )}
                          <div>
                            <Link to={`/donations/${d._id}`} className="fw-bold text-dark text-decoration-none hover-primary">
                              {d.foodName}
                            </Link>
                            <div className="text-muted small text-truncate" style={{ maxWidth: '280px' }}>
                              {d.pickupAddress}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge-category text-uppercase">{d.category?.replace('_', ' ')}</span>
                      </td>

                      <td>
                        <span className="fw-semibold text-dark">
                          {d.quantity} {d.unit}
                        </span>
                      </td>

                      <td>
                        <StatusBadge status={d.status} />
                      </td>

                      <td className="small text-muted">
                        {new Date(d.useByDate).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="text-end pe-4">
                        <div className="btn-group btn-group-sm">
                          <Link
                            to={`/donations/${d._id}`}
                            className="btn btn-outline-secondary"
                            title="View Track & Details"
                          >
                            <i className="bi bi-eye"></i> Details
                          </Link>

                          {d.status === 'AVAILABLE' && (
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => {
                                setEditingDonation(d);
                                setIsModalOpen(true);
                              }}
                              title="Edit listing"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          )}

                          {['AVAILABLE', 'REQUESTED'].includes(d.status) && (
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleCancelDonation(d._id, d.foodName)}
                              title="Cancel listing"
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Donation Modal */}
      <DonationFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDonation(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingDonation}
        title={editingDonation ? 'Edit Food Donation' : 'List New Surplus Food'}
      />
    </div>
  );
}
