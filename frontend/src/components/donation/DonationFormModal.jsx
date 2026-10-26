import React, { useState, useEffect } from 'react';
import AlertMessage from '../common/AlertMessage';

export default function DonationFormModal({ isOpen, onClose, onSubmit, initialData = null, title = 'Create Food Donation' }) {
  const getDefaultDates = () => {
    const now = new Date();
    const useBy = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now

    // Format for datetime-local: YYYY-MM-DDTHH:mm
    const toLocalISO = (d) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    return {
      preparationDate: toLocalISO(now),
      useByDate: toLocalISO(useBy),
    };
  };

  const defaultDates = getDefaultDates();

  const [formData, setFormData] = useState({
    foodName: '',
    description: '',
    category: 'cooked_meals',
    quantity: '',
    unit: 'meals',
    isVegetarian: true,
    preparationDate: defaultDates.preparationDate,
    useByDate: defaultDates.useByDate,
    storageConditions: 'ambient',
    pickupAddress: '',
    pickupContactName: '',
    pickupContactPhone: '',
    imageUrl: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        foodName: initialData.foodName || '',
        description: initialData.description || '',
        category: initialData.category || 'cooked_meals',
        quantity: initialData.quantity || '',
        unit: initialData.unit || 'meals',
        isVegetarian: initialData.isVegetarian !== undefined ? initialData.isVegetarian : true,
        preparationDate: initialData.preparationDate ? new Date(initialData.preparationDate).toISOString().slice(0, 16) : defaultDates.preparationDate,
        useByDate: initialData.useByDate ? new Date(initialData.useByDate).toISOString().slice(0, 16) : defaultDates.useByDate,
        storageConditions: initialData.storageConditions || 'ambient',
        pickupAddress: initialData.pickupAddress || '',
        pickupContactName: initialData.pickupContactName || '',
        pickupContactPhone: initialData.pickupContactPhone || '',
        imageUrl: initialData.imageUrl || '',
      });
    } else {
      const dates = getDefaultDates();
      setFormData({
        foodName: '',
        description: '',
        category: 'cooked_meals',
        quantity: '',
        unit: 'meals',
        isVegetarian: true,
        preparationDate: dates.preparationDate,
        useByDate: dates.useByDate,
        storageConditions: 'ambient',
        pickupAddress: '',
        pickupContactName: '',
        pickupContactPhone: '',
        imageUrl: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!formData.foodName.trim()) {
      setError('Food name is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (!formData.pickupAddress.trim()) {
      setError('Pickup address is required');
      return;
    }
    if (new Date(formData.useByDate) <= new Date(formData.preparationDate)) {
      setError('Use-by date must be after preparation date');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        ...formData,
        quantity: Number(formData.quantity),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save donation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow border-0">
          <div className="modal-header bg-light">
            <h5 className="modal-title fw-bold text-dark">{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit} id="donation-modal-form">
            <div className="modal-body p-4">
              <AlertMessage type="danger" message={error} onClose={() => setError('')} />

              <div className="row g-3">
                {/* Food Name */}
                <div className="col-12">
                  <label className="form-label">Food Title / Name *</label>
                  <input
                    type="text"
                    name="foodName"
                    className="form-control"
                    placeholder="e.g. 50 Vegetable Biryani Meal Platters"
                    value={formData.foodName}
                    onChange={handleChange}
                    required
                    id="input-food-name"
                  />
                </div>

                {/* Description */}
                <div className="col-12">
                  <label className="form-label">Description & Hygiene Details *</label>
                  <textarea
                    name="description"
                    rows="3"
                    className="form-control"
                    placeholder="Specify freshness, packaging, allergens, or preparation context..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    id="input-food-description"
                  ></textarea>
                </div>

                {/* Category & Veg checkbox */}
                <div className="col-md-6">
                  <label className="form-label">Food Category *</label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                    id="select-category"
                  >
                    <option value="cooked_meals">Cooked Meals</option>
                    <option value="bakery">Bakery & Breads</option>
                    <option value="raw_ingredients">Raw Ingredients & Produce</option>
                    <option value="packaged_groceries">Packaged Groceries</option>
                    <option value="beverages">Beverages</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="col-md-6 d-flex align-items-center mt-md-4 pt-md-2">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="isVegetarianSwitch"
                      name="isVegetarian"
                      checked={formData.isVegetarian}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="isVegetarianSwitch">
                      {formData.isVegetarian ? '🥬 Pure Vegetarian' : '🍗 Non-Vegetarian'}
                    </label>
                  </div>
                </div>

                {/* Quantity & Unit */}
                <div className="col-md-6">
                  <label className="form-label">Quantity *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    name="quantity"
                    className="form-control"
                    placeholder="e.g. 40"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    id="input-quantity"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Unit of Measure *</label>
                  <select
                    name="unit"
                    className="form-select"
                    value={formData.unit}
                    onChange={handleChange}
                    id="select-unit"
                  >
                    <option value="meals">Meals</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="packets">Packets</option>
                    <option value="boxes">Boxes</option>
                    <option value="liters">Liters</option>
                    <option value="servings">Servings</option>
                  </select>
                </div>

                {/* Dates */}
                <div className="col-md-6">
                  <label className="form-label">Preparation Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="preparationDate"
                    className="form-control"
                    value={formData.preparationDate}
                    onChange={handleChange}
                    required
                    id="input-prep-date"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Use-by Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="useByDate"
                    className="form-control"
                    value={formData.useByDate}
                    onChange={handleChange}
                    required
                    id="input-useby-date"
                  />
                </div>

                {/* Storage Conditions */}
                <div className="col-md-6">
                  <label className="form-label">Storage Conditions</label>
                  <select
                    name="storageConditions"
                    className="form-select"
                    value={formData.storageConditions}
                    onChange={handleChange}
                    id="select-storage"
                  >
                    <option value="ambient">Ambient / Room Temperature</option>
                    <option value="refrigerated">Refrigerated (0 - 4°C)</option>
                    <option value="frozen">Frozen (-18°C)</option>
                    <option value="hot_holding">Hot Holding (60°C+)</option>
                  </select>
                </div>

                {/* Optional Image URL */}
                <div className="col-md-6">
                  <label className="form-label">Image URL (Optional)</label>
                  <input
                    type="url"
                    name="imageUrl"
                    className="form-control"
                    placeholder="https://... image link"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    id="input-image-url"
                  />
                </div>

                {/* Pickup Address */}
                <div className="col-12">
                  <label className="form-label">Pickup Address *</label>
                  <input
                    type="text"
                    name="pickupAddress"
                    className="form-control"
                    placeholder="Kitchen/Banquet gate, Street, Landmark, City"
                    value={formData.pickupAddress}
                    onChange={handleChange}
                    required
                    id="input-pickup-address"
                  />
                </div>

                {/* Contact Name & Phone */}
                <div className="col-md-6">
                  <label className="form-label">Contact Person Name</label>
                  <input
                    type="text"
                    name="pickupContactName"
                    className="form-control"
                    placeholder="e.g. Chef Robert"
                    value={formData.pickupContactName}
                    onChange={handleChange}
                    id="input-contact-name"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    name="pickupContactPhone"
                    className="form-control"
                    placeholder="e.g. +1 555-0199"
                    value={formData.pickupContactPhone}
                    onChange={handleChange}
                    id="input-contact-phone"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting} id="save-donation-btn">
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  'Submit Food Listing'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
