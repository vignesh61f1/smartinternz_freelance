import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [resolving, setResolving] = useState(null);
  const [resolveModal, setResolveModal] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await adminService.getAllProjects(params);
      const data = res.data?.data ?? res.data;
      setProjects(Array.isArray(data) ? data : []);
      const pag = res.data?.pagination ?? res.pagination;
      if (pag) setPagination({ total: pag.total, pages: pag.pages ?? Math.ceil((pag.total || 0) / 10) });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleResolve = async (projectId, resolution) => {
    setResolving(projectId);
    try {
      await adminService.resolveDispute(projectId, { resolution });
      toast.success('Dispute resolved');
      setResolveModal(null);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setResolving(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  const getClientName = (p) => p.client?.name ?? p.clientId?.name ?? '-';
  const getFreelancerName = (p) => p.selectedFreelancer?.name ?? p.freelancer?.name ?? '-';

  return (
    <div className="manage-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        Manage Projects
      </h1>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '0.875rem',
          }}
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div
            className="data-table"
            style={{
              overflowX: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: 'white',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>Title</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>Client</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>Freelancer</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>Created</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      No projects found
                    </td>
                  </tr>
                ) : (
                  projects.map((p) => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 500 }}>{p.title || '-'}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>{getClientName(p)}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>{getFreelancerName(p)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <StatusBadge status={p.status} />
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        {formatDate(p.createdAt)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {p.status === 'disputed' && (
                          <button
                            onClick={() => setResolveModal(p._id)}
                            disabled={resolving === p._id}
                            style={{
                              padding: '0.375rem 0.75rem',
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.8125rem',
                              cursor: resolving === p._id ? 'not-allowed' : 'pointer',
                              opacity: resolving === p._id ? 0.7 : 1,
                            }}
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {resolveModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
              }}
              onClick={() => !resolving && setResolveModal(null)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  minWidth: '280px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Resolve Dispute</h3>
                <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  Choose resolution for this project:
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleResolve(resolveModal, 'complete')}
                    disabled={resolving}
                    style={{
                      flex: 1,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: resolving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleResolve(resolveModal, 'cancel')}
                    disabled={resolving}
                    style={{
                      flex: 1,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: resolving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => !resolving && setResolveModal(null)}
                    disabled={resolving}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: resolving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {pagination.pages > 1 && (
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.5 : 1,
                }}
              >
                Previous
              </button>
              <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: page >= pagination.pages ? 'not-allowed' : 'pointer',
                  opacity: page >= pagination.pages ? 0.5 : 1,
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

export default ManageProjects;
