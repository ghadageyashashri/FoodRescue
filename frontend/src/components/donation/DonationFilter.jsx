import React from 'react';

export default function DonationFilter({ filters, onFilterChange, onReset }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onFilterChange({
      ...filters,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div className="card shadow-sm border-0 p-3 mb-4">
      <div className="row g-2 align-items-center">
        {/* Search */}
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              name="search"
              className="form-control border-start-0"
              placeholder="Search food name, description, address..."
              value={filters.search || ''}
              onChange={handleChange}
              id="filter-search-input"
            />
          </div>
        </div>

        {/* Category */}
        <div className="col-md-3">
          <select
            name="category"
            className="form-select"
            value={filters.category || ''}
            onChange={handleChange}
            id="filter-category-select"
          >
            <option value="">All Categories</option>
            <option value="cooked_meals">Cooked Meals</option>
            <option value="bakery">Bakery</option>
            <option value="raw_ingredients">Raw Ingredients</option>
            <option value="packaged_groceries">Packaged Groceries</option>
            <option value="beverages">Beverages</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Status */}
        <div className="col-md-3">
          <select
            name="status"
            className="form-select"
            value={filters.status || ''}
            onChange={handleChange}
            id="filter-status-select"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="REQUESTED">Requested</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PICKUP_ASSIGNED">Pickup Assigned</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="DELIVERED">Delivered</option>
            <option value="RECEIVED">Received</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Reset */}
        <div className="col-md-2 d-flex justify-content-end">
          <button className="btn btn-outline-secondary w-100" onClick={onReset} id="filter-reset-btn">
            <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
