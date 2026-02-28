import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import projectService from '../../services/projectService';
import bidService from '../../services/bidService';
import submissionService from '../../services/submissionService';
import reviewService from '../../services/reviewService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';

const FreelancerProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ amount: '', proposal: '', deliveryDays: '' });
  const [submittingBid, setSubmittingBid] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({ description: '' });
  const [submittingSubmission, setSubmittingSubmission] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchProject();
      setLoading(false);
    };
    load();
  }, [fetchProject]);

  useEffect(() => {
    if (project?.selectedFreelancer) {
      fetchSubmissions();
    }
  }, [project?.selectedFreelancer, fetchSubmissions]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const isAssigned = project?.selectedFreelancer && (
    (project.selectedFreelancer._id || project.selectedFreelancer) === user?._id
  );

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    const amount = Number(bidForm.amount);
    const deliveryDays = Number(bidForm.deliveryDays);
    if (!amount || amount < 0 || !bidForm.proposal.trim() || !deliveryDays || deliveryDays < 1) {
      toast.error('Please fill all fields correctly');
      return;
    }
    setSubmittingBid(true);
    try {
      await bidService.createBid({
        project: id,
        amount,
        proposal: bidForm.proposal.trim(),
        deliveryDays,
      });
      toast.success('Bid submitted!');
      setBidForm({ amount: '', proposal: '', deliveryDays: '' });
      await fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit bid');
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleSubmitSubmission = async (e) => {
    e.preventDefault();
    if (!submissionForm.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    setSubmittingSubmission(true);
    try {
      await submissionService.createSubmission({
        project: id,
        description: submissionForm.description.trim(),
      });
      toast.success('Submission sent!');
      setSubmissionForm({ description: '' });
      await fetchSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmittingSubmission(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!project?.client || reviewForm.rating < 1 || !reviewForm.comment.trim()) {
      toast.error('Please provide a rating and comment');
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        project: id,
        reviewee: project.client._id || project.client,
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
          {project.skills?.length > 0 && <span>Skills: {project.skills.join(', ')}</span>}
        </div>
        {project.client && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <span style={{ fontWeight: 500 }}>Client: </span>
            {project.client?.name || 'Unknown'}
          </div>
        )}
        {isAssigned && (
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
        )}
      </div>

      {project.status === 'open' && (
        <div className="bid-form" style={{ padding: '1.5rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Place a Bid</h2>
          <form onSubmit={handleSubmitBid}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="bid-amount" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Amount ($)</label>
              <input
                id="bid-amount"
                type="number"
                min="0"
                step="0.01"
                value={bidForm.amount}
                onChange={(e) => setBidForm((prev) => ({ ...prev, amount: e.target.value }))}
                required
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="bid-delivery" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Delivery (days)</label>
              <input
                id="bid-delivery"
                type="number"
                min="1"
                value={bidForm.deliveryDays}
                onChange={(e) => setBidForm((prev) => ({ ...prev, deliveryDays: e.target.value }))}
                required
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="bid-proposal" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Proposal</label>
              <textarea
                id="bid-proposal"
                value={bidForm.proposal}
                onChange={(e) => setBidForm((prev) => ({ ...prev, proposal: e.target.value }))}
                required
                rows={4}
                placeholder="Describe your approach and why you're the right fit..."
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
              />
            </div>
            <button
              type="submit"
              disabled={submittingBid}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 500,
                cursor: submittingBid ? 'not-allowed' : 'pointer',
              }}
            >
              {submittingBid ? 'Submitting...' : 'Submit Bid'}
            </button>
          </form>
        </div>
      )}

      {isAssigned && project.status === 'in-progress' && (
        <div className="submission-form" style={{ padding: '1.5rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Submit Work</h2>
          <form onSubmit={handleSubmitSubmission}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="submission-desc" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Description</label>
              <textarea
                id="submission-desc"
                value={submissionForm.description}
                onChange={(e) => setSubmissionForm((prev) => ({ ...prev, description: e.target.value }))}
                required
                rows={4}
                placeholder="Describe your submission and include any links or attachments..."
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
              />
            </div>
            <button
              type="submit"
              disabled={submittingSubmission}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 500,
                cursor: submittingSubmission ? 'not-allowed' : 'pointer',
              }}
            >
              {submittingSubmission ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      )}

      {isAssigned && submissions.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>My Submissions</h2>
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
                  <span style={{ fontWeight: 500 }}>{new Date(sub.createdAt).toLocaleDateString()}</span>
                  <StatusBadge status={sub.status} />
                </div>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>{sub.description}</p>
              </div>
            ))}
          </div>
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

        {project.status === 'completed' && isAssigned && project.client && !hasReviewed && (
          <form onSubmit={handleSubmitReview} style={{ padding: '1rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Leave a Review for the Client</h3>
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
    </div>
  );
};

export default FreelancerProjectDetail;
