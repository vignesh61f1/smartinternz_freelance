import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import StarRating from '../../components/common/StarRating';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', skills: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const skillsArray = form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await authService.updateProfile({
        name: form.name,
        bio: form.bio,
        skills: skillsArray,
      });
      const data = res.data?.data ?? res.data;
      updateUser(data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        My Profile
      </h1>

      <div
        className="profile-card"
        style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
        }}
      >
        {editing ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                Skills (comma-separated)
              </label>
              <input
                type="text"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, Design"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={submitting}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Name</span>
              <div style={{ fontSize: '1rem', fontWeight: 500 }}>{user.name || '-'}</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Email</span>
              <div style={{ fontSize: '1rem' }}>{user.email || '-'}</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Role</span>
              <div style={{ fontSize: '1rem', textTransform: 'capitalize' }}>{user.role || '-'}</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Bio</span>
              <div style={{ fontSize: '1rem' }}>{user.bio || '-'}</div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Skills</span>
              <div style={{ fontSize: '1rem' }}>
                {Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || '-')}
              </div>
            </div>
            {user.rating != null && (
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Rating</span>
                <div style={{ marginTop: '0.25rem' }}>
                  <StarRating rating={user.rating} />
                </div>
              </div>
            )}
            <button
              onClick={() => setEditing(true)}
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
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
