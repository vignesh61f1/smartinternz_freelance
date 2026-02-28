import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import projectService from '../../services/projectService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORIES = [
  'web-development',
  'mobile-development',
  'design',
  'writing',
  'marketing',
  'data-science',
  'video-editing',
  'other',
];

const BrowseProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minBudget: '',
    maxBudget: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0 });

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const params = {
          status: 'open',
          page: filters.page,
          limit: filters.limit,
        };
        if (filters.search.trim()) params.search = filters.search.trim();
        if (filters.category) params.category = filters.category;
        if (filters.minBudget) params.minBudget = filters.minBudget;
        if (filters.maxBudget) params.maxBudget = filters.maxBudget;

        const res = await projectService.getProjects(params);
        const data = res.data?.data ?? res.data;
        setProjects(Array.isArray(data) ? data : []);
        const pag = res.data?.pagination ?? res.pagination;
        if (pag) setPagination({ total: pag.total, page: pag.page, pages: pag.pages });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load projects');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [filters.page, filters.limit, filters.search, filters.category, filters.minBudget, filters.maxBudget]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
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

  const excerpt = (text, maxLen = 120) => {
    if (!text) return '';
    return text.length <= maxLen ? text : text.slice(0, maxLen) + '...';
  };

  return (
    <div className="browse-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>Browse Projects</h1>

      <form onSubmit={handleSearch} className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>Search</label>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          />
        </div>
        <div style={{ flex: '0 1 160px' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>Category</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value, page: 1 }))}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          >
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '0 1 100px' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>Min $</label>
          <input
            type="number"
            placeholder="Min"
            min="0"
            value={filters.minBudget}
            onChange={(e) => setFilters((prev) => ({ ...prev, minBudget: e.target.value, page: 1 }))}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          />
        </div>
        <div style={{ flex: '0 1 100px' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>Max $</label>
          <input
            type="number"
            placeholder="Max"
            min="0"
            value={filters.maxBudget}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxBudget: e.target.value, page: 1 }))}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </form>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="project-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {projects.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                No open projects found. Try adjusting your filters.
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
                  <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    {excerpt(project.description)}
                  </p>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    Budget: {formatBudget(project.budget)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    Deadline: {formatDate(project.deadline)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <span>Category: {project.category?.replace(/-/g, ' ')}</span>
                    <span>·</span>
                    <span>Bids: {project.bidCount ?? 0}</span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.page <= 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer',
                  opacity: pagination.page >= pagination.pages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseProjects;
