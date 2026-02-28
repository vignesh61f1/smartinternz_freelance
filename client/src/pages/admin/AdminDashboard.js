import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        const data = res.data?.data ?? res.data;
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page" style={{ padding: '2rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px' }}>
          {error}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.users?.total ?? 0 },
    { label: 'Clients', value: stats?.users?.clients ?? 0 },
    { label: 'Freelancers', value: stats?.users?.freelancers ?? 0 },
    { label: 'Total Projects', value: stats?.projects?.total ?? 0 },
    { label: 'Open Projects', value: stats?.projects?.open ?? 0 },
    { label: 'Completed Projects', value: stats?.projects?.completed ?? 0 },
    { label: 'Disputed Projects', value: stats?.projects?.disputed ?? 0 },
    { label: 'Total Bids', value: stats?.totalBids ?? 0 },
  ];

  return (
    <div className="dashboard-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        Admin Dashboard
      </h1>
      <div
        className="stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
        }}
      >
        {statCards.map(({ label, value }) => (
          <div
            key={label}
            className="stat-card"
            style={{
              padding: '1.25rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>{value}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
