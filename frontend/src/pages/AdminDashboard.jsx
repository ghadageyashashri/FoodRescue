import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('ngos'); // 'ngos' | 'users' | 'donations' | 'activity'
  const [metrics, setMetrics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, orgsRes, usersRes, donationsRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/organizations'),
        api.get('/users'),
        api.get('/donations?limit=100'),
      ]);

      if (overviewRes.data.success) {
        setMetrics(overviewRes.data.metrics);
        setRecentActivity(overviewRes.data.recentActivity);
      }
      if (orgsRes.data.success) {
        setOrganizations(orgsRes.data.organizations);
      }
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users);
      }
      if (donationsRes.data.success) {
        setAllDonations(donationsRes.data.donations);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Handle NGO Verification
  const handleVerifyOrg = async (orgId, status) => {
    try {
      const notes = prompt(`Optional verification notes for setting status to "${status}":`) || '';
      const res = await api.patch(`/admin/organizations/${orgId}/verify`, {
        verificationStatus: status,
        verificationNotes: notes,
      });

      if (res.data.success) {
        setSuccessMsg(`Organization status updated to "${status}".`);
        fetchAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification update failed.');
    }
  };

  // Toggle user suspension
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to change user account status to "${newStatus}"?`)) return;

    try {
      const res = await api.patch(`/users/${userId}/status`, { accountStatus: newStatus });
      if (res.data.success) {
        setSuccessMsg(`User status updated to "${newStatus}".`);
        fetchAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="container py-4">
      {/* Top Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <span className="badge bg-danger-subtle text-danger fw-bold text-uppercase px-2 py-1 mb-1">
            <i className="bi bi-shield-lock-fill me-1"></i> System Administration
          </span>
          <h2 className="fw-bold text-dark mb-0">Platform Overview & Management</h2>
          <p className="text-muted small mb-0">Enforce compliance, verify NGO charities, and monitor food rescue operations</p>
        </div>
      </div>

      <AlertMessage type="danger" message={error} onClose={() => setError('')} />
      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      {/* Metrics Row */}
      {metrics && (
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-6">
            <StatCard
              title="Total Registered Users"
              value={metrics.totalUsers}
              icon="bi-people-fill"
              gradientClass="stat-gradient-1"
              subtitle="Donors, NGOs & Volunteers"
            />
          </div>
          <div className="col-md-3 col-6">
            <StatCard
              title="Total Food Listings"
              value={metrics.totalDonations}
              icon="bi-box-seam"
              gradientClass="stat-gradient-2"
              subtitle="All platform records"
            />
          </div>
          <div className="col-md-3 col-6">
            <StatCard
              title="Active Rescues"
              value={metrics.activeDonations}
              icon="bi-arrow-repeat"
              gradientClass="stat-gradient-3"
              subtitle="Pending / In transit"
            />
          </div>
          <div className="col-md-3 col-6">
            <StatCard
              title="Pending NGO Verifications"
              value={metrics.pendingNgos}
              icon="bi-clock-history"
              gradientClass="stat-gradient-4"
              subtitle="Requires admin approval"
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-3 border shadow-sm" id="admin-tabs">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'ngos' ? 'active' : ''}`}
            onClick={() => setActiveTab('ngos')}
            id="tab-manage-ngos"
          >
            <i className="bi bi-building-check me-1"></i> NGO Verifications ({organizations.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            id="tab-manage-users"
          >
            <i className="bi bi-people me-1"></i> User Directory ({usersList.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'donations' ? 'active' : ''}`}
            onClick={() => setActiveTab('donations')}
            id="tab-all-donations"
          >
            <i className="bi bi-list-task me-1"></i> All Platform Donations ({allDonations.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
            id="tab-audit-activity"
          >
            <i className="bi bi-activity me-1"></i> Live Activity Audit
          </button>
        </li>
      </ul>

      {loading ? (
        <LoadingSpinner message="Loading administrator data..." />
      ) : (
        <>
          {/* TAB 1: NGO Verification */}
          {activeTab === 'ngos' && (
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="card-header bg-white p-3 border-bottom">
                <h5 className="fw-bold mb-0">Registered NGO Organizations</h5>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th className="ps-4">Organization Name</th>
                      <th>Representative</th>
                      <th>Reg. Number</th>
                      <th>Location</th>
                      <th>Verification Status</th>
                      <th className="text-end pe-4">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.map((org) => (
                      <tr key={org._id}>
                        <td className="ps-4 py-3">
                          <strong className="text-dark">{org.organizationName}</strong>
                          <div className="text-muted small">{org.mission}</div>
                        </td>
                        <td>
                          <div>{org.user?.name}</div>
                          <div className="text-muted small">{org.user?.email}</div>
                        </td>
                        <td className="small">{org.registrationNumber || 'Not specified'}</td>
                        <td className="small">{org.address}</td>
                        <td>
                          <span
                            className={`badge ${
                              org.verificationStatus === 'verified'
                                ? 'bg-success'
                                : org.verificationStatus === 'rejected'
                                ? 'bg-danger'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            {org.verificationStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="btn-group btn-group-sm">
                            {org.verificationStatus !== 'verified' && (
                              <button
                                className="btn btn-outline-success"
                                onClick={() => handleVerifyOrg(org._id, 'verified')}
                                title="Approve Verification"
                                id={`approve-org-${org._id}`}
                              >
                                <i className="bi bi-check-lg"></i> Approve
                              </button>
                            )}
                            {org.verificationStatus !== 'rejected' && (
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleVerifyOrg(org._id, 'rejected')}
                                title="Reject Verification"
                                id={`reject-org-${org._id}`}
                              >
                                <i className="bi bi-x-lg"></i> Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Users Management */}
          {activeTab === 'users' && (
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="card-header bg-white p-3 border-bottom">
                <h5 className="fw-bold mb-0">Platform User Accounts</h5>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th className="ps-4">User</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Account Status</th>
                      <th>Joined Date</th>
                      <th className="text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u._id}>
                        <td className="ps-4 py-3">
                          <div className="fw-bold text-dark">{u.name}</div>
                          <div className="text-muted small">{u.email}</div>
                        </td>
                        <td>
                          <span className="badge bg-secondary-subtle text-secondary text-uppercase">
                            {u.role}
                          </span>
                        </td>
                        <td className="small">{u.phone}</td>
                        <td>
                          <span
                            className={`badge ${
                              u.accountStatus === 'active' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
                            }`}
                          >
                            {u.accountStatus}
                          </span>
                        </td>
                        <td className="small text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="text-end pe-4">
                          {u.role !== 'admin' && (
                            <button
                              className={`btn btn-sm ${
                                u.accountStatus === 'active' ? 'btn-outline-danger' : 'btn-outline-success'
                              }`}
                              onClick={() => handleToggleUserStatus(u._id, u.accountStatus)}
                            >
                              {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: All Donations */}
          {activeTab === 'donations' && (
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="card-header bg-white p-3 border-bottom">
                <h5 className="fw-bold mb-0">Global Platform Donations</h5>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th className="ps-4">Food Item</th>
                      <th>Donor</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th>Use By</th>
                      <th className="text-end pe-4">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDonations.map((d) => (
                      <tr key={d._id}>
                        <td className="ps-4 py-3">
                          <Link to={`/donations/${d._id}`} className="fw-bold text-dark text-decoration-none">
                            {d.foodName}
                          </Link>
                          <div className="text-muted small">{d.category}</div>
                        </td>
                        <td>{d.donor?.name}</td>
                        <td className="fw-semibold">
                          {d.quantity} {d.unit}
                        </td>
                        <td>
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="small text-muted">{new Date(d.useByDate).toLocaleString()}</td>
                        <td className="text-end pe-4">
                          <Link to={`/donations/${d._id}`} className="btn btn-outline-secondary btn-sm">
                            Inspect Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Live Activity Log */}
          {activeTab === 'activity' && (
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="card-header bg-white p-3 border-bottom">
                <h5 className="fw-bold mb-0">Immutable Audit Trail</h5>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th className="ps-4">Timestamp</th>
                      <th>Donation Item</th>
                      <th>Transition</th>
                      <th>Actor</th>
                      <th>Audit Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((a) => (
                      <tr key={a._id}>
                        <td className="ps-4 small text-muted">
                          {new Date(a.timestamp).toLocaleString()}
                        </td>
                        <td className="fw-semibold">
                          {a.donation?.foodName || 'Donation Item'}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <StatusBadge status={a.previousStatus} />
                            <i className="bi bi-arrow-right text-muted small"></i>
                            <StatusBadge status={a.newStatus} />
                          </div>
                        </td>
                        <td>
                          <span className="fw-bold small">{a.actor?.name}</span>{' '}
                          <span className="badge bg-light text-secondary border small text-uppercase">
                            {a.actor?.role}
                          </span>
                        </td>
                        <td className="small text-secondary">{a.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
