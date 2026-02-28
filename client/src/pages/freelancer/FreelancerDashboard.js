import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import projectService from '../../services/projectService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getMyProjects();
        const data = res.data?.data ?? res.data;
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === 'in-progress').length,
    completed: projects.filter((p) => p.status === 'completed').length,
  };

  const formatBudget = (budget) => {
    if (!budget) return '-';
    const min = budget.min ?? 0;
    const max = budget.max ?? 0;
    return max ? `$${min} - $${max}` : `$${min}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="dashboard-page" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="dashboard-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>
          Welcome, {user?.name || 'Freelancer'}!
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
          Manage your assigned projects and track progress
        </p>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link
          to="/freelancer/browse"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 500,
          }}
        >
          <FiBriefcase size={20} />
          Browse Projects
        </Link>
        <Link
          to="/freelancer/my-bids"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 500,
          }}
        >
          <FiDollarSign size={20} />
          My Bids
        </Link>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>{stats.total}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Assigned</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>{stats.inProgress}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>In Progress</div>
        </div>
        <div style={{ padding: '1rem', backgroundColor: '#f5f3ff', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>{stats.completed}</div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Completed</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>My Assigned Projects</h2>
      <div className="project-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {projects.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            No assigned projects yet. Browse open projects and place bids to get started!
          </div>
        ) : (
          projects.map((project) => (
            <Link
              key={project._id}
              to={`/freelancer/project/${project._id}`}
              className="project-card"
              style={{
                padding: '1.25rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'box-shadow 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, flex: 1 }}>{project.title}</h3>
                <StatusBadge status={project.status} />
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                Budget: {formatBudget(project.budget)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Deadline: {formatDate(project.deadline)}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default FreelancerDashboard;
