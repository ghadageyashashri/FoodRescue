import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import DonationCard from '../components/donation/DonationCard';
import DonationFilter from '../components/donation/DonationFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function DonationsListPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
  });

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.status) queryParams.append('status', filters.status);

      const res = await api.get(`/donations?${queryParams.toString()}`);
      if (res.data.success) {
        setDonations(res.data.donations);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  return (
    <div className="container py-4">
      <div className="text-center mb-4" style={{ maxWidth: '650px', margin: '0 auto' }}>
        <span className="badge bg-success-subtle text-success fw-bold text-uppercase px-3 py-1 rounded-pill mb-2">
          Surplus Food Directory
        </span>
        <h2 className="fw-bold text-dark">Explore Available Food Listings</h2>
        <p className="text-muted small">
          Search wholesome surplus meals listed by local hotels, event halls, bakeries, and markets.
        </p>
      </div>

      <DonationFilter
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onReset={() => setFilters({ search: '', category: '', status: '' })}
      />

      {loading ? (
        <LoadingSpinner message="Searching food listings..." />
      ) : donations.length === 0 ? (
        <EmptyState
          icon="bi-egg-fried"
          title="No food listings found"
          description="Try broadening your search query or reset your filters."
          actionText="Reset Filters"
          onAction={() => setFilters({ search: '', category: '', status: '' })}
        />
      ) : (
        <div className="row g-4">
          {donations.map((d) => (
            <div key={d._id} className="col-lg-3 col-md-6">
              <DonationCard donation={d} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
