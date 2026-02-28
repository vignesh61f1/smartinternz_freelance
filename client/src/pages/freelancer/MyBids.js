import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import bidService from '../../services/bidService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await bidService.getMyBids();
        const data = res.data?.data ?? res.data;
        setBids(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bids');
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  const handleWithdraw = async (bidId) => {
    setWithdrawingId(bidId);
    try {
      await bidService.withdrawBid(bidId);
      toast.success('Bid withdrawn');
      setBids((prev) => prev.filter((b) => b._id !== bidId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw bid');
    } finally {
      setWithdrawingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bids-page" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bids-page" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>My Bids</h1>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {bids.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          No bids yet. Browse projects and place your first bid!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bids.map((bid) => (
            <div
              key={bid._id}
              className="bid-card"
              style={{
                padding: '1.25rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <Link
                    to={`/freelancer/project/${bid.project?._id || bid.project}`}
                    style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', textDecoration: 'none' }}
                  >
                    {bid.project?.title || 'Project'}
                  </Link>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    ${bid.amount} · {bid.deliveryDays} days · Placed {formatDate(bid.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={bid.status} />
                  {bid.status === 'pending' && (
                    <button
                      onClick={() => handleWithdraw(bid._id)}
                      disabled={withdrawingId === bid._id}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 500,
                        cursor: withdrawingId ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {withdrawingId === bid._id ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBids;
