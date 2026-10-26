import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'ngo':
        return '/ngo/dashboard';
      case 'volunteer':
        return '/volunteer/dashboard';
      case 'donor':
      default:
        return '/donor/dashboard';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg glass-nav py-2" id="main-navbar">
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div
            className="d-flex align-items-center justify-content-center text-white rounded-circle shadow-sm"
            style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              fontSize: '1.25rem',
            }}
          >
            🍲
          </div>
          <div>
            <span className="brand-font fs-4 fw-bold text-dark">Food</span>
            <span className="brand-font fs-4 fw-bold text-success">Rescue</span>
          </div>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3 text-secondary" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3 text-secondary" to="/donations">
                Explore Donations
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3 text-secondary" to="/impact">
                Live Impact
              </Link>
            </li>
          </ul>

          {/* User actions */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="position-relative">
                  <button
                    className="btn btn-light rounded-circle position-relative border"
                    style={{ width: '42px', height: '42px' }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    id="notification-bell-btn"
                    title="Notifications"
                  >
                    <i className="bi bi-bell-fill text-secondary"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div
                      className="card shadow-lg position-absolute end-0 mt-2 p-0 border animate-fade-in"
                      style={{ width: '340px', zIndex: 1050 }}
                    >
                      <div className="card-header bg-white d-flex justify-content-between align-items-center py-2 px-3">
                        <span className="fw-bold fs-6">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            className="btn btn-sm btn-link text-decoration-none text-success p-0"
                            onClick={() => markAsRead('all')}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div className="p-3 text-center text-muted small">No notifications yet</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              className={`list-group-item list-group-item-action p-2 px-3 small ${
                                !n.read ? 'bg-light fw-semibold' : ''
                              }`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                if (!n.read) markAsRead(n._id);
                                if (n.link) {
                                  navigate(n.link);
                                  setShowNotifications(false);
                                }
                              }}
                            >
                              <div className="d-flex justify-content-between">
                                <span className="text-dark">{n.title}</span>
                                <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="text-muted text-truncate" style={{ fontSize: '0.8rem' }}>
                                {n.message}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dashboard Link */}
                <Link to={getDashboardPath()} className="btn btn-outline-primary d-flex align-items-center gap-1" id="nav-dashboard-link">
                  <i className="bi bi-grid-fill"></i>
                  <span>Dashboard</span>
                </Link>

                {/* User Role Badge & Dropdown / Logout */}
                <div className="dropdown">
                  <button
                    className="btn btn-light border d-flex align-items-center gap-2 px-3 py-1 rounded-pill"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle fs-5 text-success"></i>
                    <div className="text-start d-none d-md-block">
                      <div className="fw-bold small text-dark lh-1">{user.name.split(' ')[0]}</div>
                      <span className="badge bg-secondary-subtle text-secondary text-uppercase" style={{ fontSize: '0.65rem' }}>
                        {user.role}
                      </span>
                    </div>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border mt-2">
                    <li className="px-3 py-2 border-bottom">
                      <div className="fw-bold">{user.name}</div>
                      <div className="text-muted small">{user.email}</div>
                      <span className="badge bg-success-subtle text-success text-uppercase mt-1">
                        Role: {user.role}
                      </span>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2" to={getDashboardPath()}>
                        <i className="bi bi-speedometer2 me-2 text-primary"></i> My Dashboard
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider my-1" /></li>
                    <li>
                      <button className="dropdown-item text-danger py-2" onClick={handleLogout} id="nav-logout-btn">
                        <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-secondary px-3" id="nav-login-btn">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary px-3 shadow-sm" id="nav-register-btn">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
