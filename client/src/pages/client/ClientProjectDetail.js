import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import projectService from '../../services/projectService';
import bidService from '../../services/bidService';
import submissionService from '../../services/submissionService';
import reviewService from '../../services/reviewService';
import paymentService from '../../services/paymentService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';

const ClientProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingBid, setAcceptingBid] = useState(null);
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [clientNotes, setClientNotes] = useState({});
  const [payments, setPayments] = useState([]);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'platform', transactionId: '' });
  const [recordingPayment, setRecordingPayment] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    try {
      const res = await projectService.getProject(id);
      const data = res.data?.data ?? res.data;
      setProject(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load project');
    }
  }, [id]);

  const fetchBids = useCallback(async () => {
    if (!id) return;
    try {
      const res = await bidService.getProjectBids(id);
      const data = res.data?.data ?? res.data;
      setBids(Array.isArray(data) ? data : []);
    } catch {
      setBids([]);
    }
  }, [id]);

  const fetchSubmissions = useCallback(async () => {
    if (!id) return;
    try {
      const res = await submissionService.getProjectSubmissions(id);
      const data = res.data?.data ?? res.data;
      setSubmissions(Array.isArray(data) ? data : []);
    } catch {
      setSubmissions([]);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    try {
      const res = await reviewService.getProjectReviews(id);
      const data = res.data?.data ?? res.data;
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    }
  }, [id]);

  const fetchPayments = useCallback(async () => {
    if (!id) return;
    try {
      const res = await paymentService.getProjectPayments(id);
      const data = res.data?.data ?? res.data;
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      setPayments([]);
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchProject();
      await fetchBids();
      setLoading(false);
    };
    load();
  }, [fetchProject, fetchBids]);

  useEffect(() => {
    if (project?.selectedFreelancer) {
      fetchSubmissions();
    }
  }, [project?.selectedFreelancer, fetchSubmissions]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (project?.status === 'completed' && project?.selectedFreelancer) {
      fetchPayments();
    }
  }, [project?.status, project?.selectedFreelancer, fetchPayments]);

  const handleAcceptBid = async (bidId) => {
    setAcceptingBid(bidId);
    try {
      await bidService.acceptBid(bidId);
      toast.success('Bid accepted!');
      await fetchProject();
      await fetchBids();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept bid');
    } finally {
      setAcceptingBid(null);
    }
  };

  const handleReviewSubmission = async (subId, status) => {
    setReviewingSubmission(subId);
    try {
      await submissionService.reviewSubmission(subId, {
        status,
        clientNotes: clientNotes[subId] || '',
      });
      toast.success(status === 'accepted' ? 'Submission accepted!' : 'Revision requested');
      await fetchProject();
      await fetchSubmissions();
      setClientNotes((prev) => ({ ...prev, [subId]: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review submission');
    } finally {
      setReviewingSubmission(null);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!project?.selectedFreelancer || reviewForm.rating < 1 || !reviewForm.comment.trim()) {
      toast.error('Please provide a rating and comment');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        project: id,
        reviewee: project.selectedFreelancer._id || project.selectedFreelancer,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });
      toast.success('Review submitted!');
      setReviewForm({ rating: 0, comment: '' });
      await fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const acceptedBidAmount = bids.find((b) => b.status === 'accepted')?.amount;
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setRecordingPayment(true);
    try {
      await paymentService.createPayment({
        project: id,
        amount,
        method: paymentForm.method,
        transactionId: paymentForm.transactionId?.trim() || undefined,
      });
      toast.success('Payment recorded!');
      setPaymentForm({ amount: '', method: 'platform', transactionId: '' });
      await fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setRecordingPayment(false);
    }
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

  const currentUserId = user?._id;
  const hasReviewed = reviews.some(
    (r) =>
      (r.reviewer?._id && r.reviewer._id === currentUserId) ||
      (typeof r.reviewer === 'string' && r.reviewer === currentUserId)
  );

  if (loading || !project) {
    return (
      <div className="detail-page" style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="detail-page" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div className="detail-card" style={{ padding: '1.5rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>{project.title}</h1>
          <StatusBadge status={project.status} />
        </div>
        <p style={{ color: '#4b5563', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{project.description}</p>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#6b7280' }}>
          <span>Category: {project.category?.replace(/-/g, ' ')}</span>
          <span>Budget: {formatBudget(project.budget)}</span>
          <span>Deadline: {formatDate(project.deadline)}</span>
          {project.skills?.length > 0 && (
            <span>Skills: {project.skills.join(', ')}</span>
          )}
        </div>
        {project.selectedFreelancer && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <span style={{ fontWeight: 500 }}>Assigned freelancer: </span>
            {project.selectedFreelancer?.name || 'Unknown'}
          </div>
        )}
        <Link
          to={`/chat/${id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            textDecoration: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
          }}
        >
          <FiMessageCircle size={18} />
          Open Chat
        </Link>
      </div>

      <div className="bids-section" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Bids ({bids.length})</h2>
        {bids.length === 0 ? (
          <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px', color: '#6b7280', textAlign: 'center' }}>
            No bids yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bids.map((bid) => (
              <div
                key={bid._id}
                style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{bid.freelancer?.name || 'Freelancer'}</span>
                    <span style={{ marginLeft: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      ${bid.amount} · {bid.deliveryDays} days
                    </span>
                  </div>
                  <StatusBadge status={bid.status} />
                </div>
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.875rem', color: '#4b5563' }}>{bid.proposal}</p>
                {bid.status === 'pending' && project.status === 'open' && (
                  <button
                    onClick={() => handleAcceptBid(bid._id)}
                    disabled={acceptingBid === bid._id}
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 500,
                      cursor: acceptingBid ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {acceptingBid === bid._id ? 'Accepting...' : 'Accept Bid'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {project.selectedFreelancer && (
        <div className="submission-section" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Submissions</h2>
          {submissions.length === 0 ? (
            <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px', color: '#6b7280', textAlign: 'center' }}>
              No submissions yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {submissions.map((sub) => (
                <div
                  key={sub._id}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 500 }}>{sub.freelancer?.name || 'Freelancer'}</span>
                    <StatusBadge status={sub.status} />
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.75rem' }}>{sub.description}</p>
                  {['submitted', 'under-review', 'revision-requested'].includes(sub.status) && (
                    <>
                      <textarea
                        placeholder="Client notes (for revision)"
                        value={clientNotes[sub._id] || ''}
                        onChange={(e) => setClientNotes((prev) => ({ ...prev, [sub._id]: e.target.value }))}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          marginBottom: '0.5rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleReviewSubmission(sub._id, 'accepted')}
                          disabled={reviewingSubmission === sub._id}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#22c55e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 500,
                            cursor: reviewingSubmission ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {reviewingSubmission === sub._id ? '...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleReviewSubmission(sub._id, 'revision-requested')}
                          disabled={reviewingSubmission === sub._id}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 500,
                            cursor: reviewingSubmission ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Request Revision
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Reviews</h2>
        {reviews.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
            {reviews.map((rev) => (
              <div
                key={rev._id}
                style={{
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <StarRating rating={rev.rating} interactive={false} />
                  <span style={{ fontWeight: 500 }}>{rev.reviewer?.name || 'User'}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#4b5563' }}>{rev.comment}</p>
              </div>
            ))}
          </div>
        )}

        {project.status === 'completed' && project.selectedFreelancer && !hasReviewed && (
          <form onSubmit={handleSubmitReview} style={{ padding: '1rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Leave a Review</h3>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Rating</label>
              <StarRating
                rating={reviewForm.rating}
                onRate={(r) => setReviewForm((prev) => ({ ...prev, rating: r }))}
                interactive
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="review-comment" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Comment</label>
              <textarea
                id="review-comment"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                required
                rows={3}
                placeholder="Share your experience"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
              />
            </div>
            <button
              type="submit"
              disabled={submittingReview || reviewForm.rating < 1}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 500,
                cursor: submittingReview ? 'not-allowed' : 'pointer',
              }}
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>

      {project.status === 'completed' && project.selectedFreelancer && (
        <div className="payments-section" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Payment</h2>
          {payments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {payments.map((pay) => (
                <div
                  key={pay._id}
                  style={{
                    padding: '1rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>${pay.amount}</span>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {pay.method} {pay.transactionId ? `· ${pay.transactionId}` : ''}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {new Date(pay.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
          <form
            onSubmit={handleRecordPayment}
            style={{ padding: '1rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Record payment</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '320px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder={acceptedBidAmount ? `e.g. ${acceptedBidAmount}` : 'Amount'}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, method: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
                >
                  <option value="platform">Platform</option>
                  <option value="external">External (bank, etc.)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Transaction ID (optional)</label>
                <input
                  type="text"
                  placeholder="Reference number"
                  value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, transactionId: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
                />
              </div>
              <button
                type="submit"
                disabled={recordingPayment || !paymentForm.amount}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: recordingPayment ? 'not-allowed' : 'pointer',
                }}
              >
                {recordingPayment ? 'Recording...' : 'Record payment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClientProjectDetail;
