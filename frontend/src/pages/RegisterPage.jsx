import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/common/AlertMessage';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'donor',
    address: '',
    organizationName: '',
    registrationNumber: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    if (formData.role === 'ngo' && !formData.organizationName.trim()) {
      setError('Organization name is required for NGO accounts.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await register(formData);
      if (res.success) {
        switch (res.user.role) {
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
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-7 col-md-9">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-dark">Join FoodRescue</h3>
                <p className="text-muted small">
                  Create your account to start donating, requesting, or delivering surplus food
                </p>
              </div>

              <AlertMessage type="danger" message={error} onClose={() => setError('')} />

              <form onSubmit={handleSubmit} id="register-form">
                {/* Role selection radio buttons */}
                <div className="mb-4">
                  <label className="form-label d-block text-center fw-bold">Select Your Role</label>
                  <div className="row g-2">
                    <div className="col-4">
                      <input
                        type="radio"
                        className="btn-check"
                        name="role"
                        id="role-donor"
                        value="donor"
                        checked={formData.role === 'donor'}
                        onChange={handleChange}
                      />
                      <label className="btn btn-outline-success w-100 py-3 text-center" htmlFor="role-donor">
                        <i className="bi bi-shop fs-4 d-block mb-1"></i>
                        <span className="fw-bold small d-block">Donor</span>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Restaurant / Hotel</span>
                      </label>
                    </div>

                    <div className="col-4">
                      <input
                        type="radio"
                        className="btn-check"
                        name="role"
                        id="role-ngo"
                        value="ngo"
                        checked={formData.role === 'ngo'}
                        onChange={handleChange}
                      />
                      <label className="btn btn-outline-primary w-100 py-3 text-center" htmlFor="role-ngo">
                        <i className="bi bi-heart fs-4 d-block mb-1"></i>
                        <span className="fw-bold small d-block">NGO</span>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Charity / Shelter</span>
                      </label>
                    </div>

                    <div className="col-4">
                      <input
                        type="radio"
                        className="btn-check"
                        name="role"
                        id="role-volunteer"
                        value="volunteer"
                        checked={formData.role === 'volunteer'}
                        onChange={handleChange}
                      />
                      <label className="btn btn-outline-warning w-100 py-3 text-center" htmlFor="role-volunteer">
                        <i className="bi bi-bicycle fs-4 d-block mb-1"></i>
                        <span className="fw-bold small d-block">Volunteer</span>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Delivery Driver</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="e.g. John Doe / Coordinator Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      id="register-name-input"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="e.g. +1 555-0145"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      id="register-phone-input"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      id="register-email-input"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Password * (min 6 characters)</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      id="register-password-input"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Primary Address / Location</label>
                    <input
                      type="text"
                      name="address"
                      className="form-control"
                      placeholder="Street, City, Postal Code"
                      value={formData.address}
                      onChange={handleChange}
                      id="register-address-input"
                    />
                  </div>
                </div>

                {/* Additional NGO Fields */}
                {formData.role === 'ngo' && (
                  <div className="p-3 bg-light rounded-3 border mb-3 animate-fade-in">
                    <h6 className="fw-bold text-primary mb-3">
                      <i className="bi bi-building me-1"></i> Organization Profile Details
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-7">
                        <label className="form-label">Organization / Charity Name *</label>
                        <input
                          type="text"
                          name="organizationName"
                          className="form-control"
                          placeholder="e.g. Hope Food Mission"
                          value={formData.organizationName}
                          onChange={handleChange}
                          required={formData.role === 'ngo'}
                          id="register-orgname-input"
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label">Registration No. (Optional)</label>
                        <input
                          type="text"
                          name="registrationNumber"
                          className="form-control"
                          placeholder="e.g. NGO-2024-XX"
                          value={formData.registrationNumber}
                          onChange={handleChange}
                          id="register-regnum-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold mb-3 mt-2"
                  disabled={submitting}
                  id="register-submit-btn"
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Registering Account...
                    </>
                  ) : (
                    'Create FoodRescue Account'
                  )}
                </button>
              </form>

              <div className="text-center text-muted small">
                Already registered?{' '}
                <Link to="/login" className="fw-semibold text-success text-decoration-none">
                  Sign in here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
