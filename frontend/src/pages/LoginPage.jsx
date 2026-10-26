import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/common/AlertMessage';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(email, password);
      if (res.success) {
        if (redirectPath) {
          navigate(redirectPath);
        } else {
          switch (res.user.role) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'ngo':
              navigate('/ngo/dashboard');
              break;
            case 'volunteer':
              navigate('/volunteer/dashboard');
              break;
            case 'donor':
            default:
              navigate('/donor/dashboard');
              break;
          }
        }
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-8">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="p-4 p-md-5">
              <div className="text-center mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center text-white rounded-circle shadow-sm mb-3"
                  style={{
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    fontSize: '1.75rem',
                  }}
                >
                  🍲
                </div>
                <h3 className="fw-bold text-dark">Welcome Back</h3>
                <p className="text-muted small">Sign in to coordinate food donations and tracking</p>
              </div>

              <AlertMessage type="danger" message={error} onClose={() => setError('')} />

              <form onSubmit={handleSubmit} id="login-form">
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@organization.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      id="login-email-input"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      id="login-password-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold mb-3"
                  disabled={submitting}
                  id="login-submit-btn"
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Authenticating...
                    </>
                  ) : (
                    'Sign In to FoodRescue'
                  )}
                </button>
              </form>

              {/* Demo Account Quick-Fill Buttons for Viva/Evaluation */}
              <div className="p-3 bg-light rounded-3 border mb-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small fw-bold text-secondary">
                    <i className="bi bi-magic me-1 text-success"></i> 1-Click Demo Login
                  </span>
                  <span className="badge bg-success-subtle text-success small">Quick Test</span>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="demo-role-btn"
                    onClick={() => handleDemoFill('donor@grandhotel.com', 'Donor@123')}
                    id="demo-donor-btn"
                  >
                    🏢 <strong>Donor</strong> (Hotel)
                  </button>
                  <button
                    type="button"
                    className="demo-role-btn"
                    onClick={() => handleDemoFill('contact@feedhope.org', 'Ngo@123')}
                    id="demo-ngo-btn"
                  >
                    🤝 <strong>NGO</strong> (FeedHope)
                  </button>
                  <button
                    type="button"
                    className="demo-role-btn"
                    onClick={() => handleDemoFill('alex.volunteer@gmail.com', 'Volunteer@123')}
                    id="demo-volunteer-btn"
                  >
                    🚚 <strong>Volunteer</strong> (Driver)
                  </button>
                  <button
                    type="button"
                    className="demo-role-btn"
                    onClick={() => handleDemoFill('admin@foodrescue.org', 'Admin@123')}
                    id="demo-admin-btn"
                  >
                    👑 <strong>Admin</strong>
                  </button>
                </div>
              </div>

              <div className="text-center text-muted small">
                Don't have an account yet?{' '}
                <Link to="/register" className="fw-semibold text-success text-decoration-none">
                  Register here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
