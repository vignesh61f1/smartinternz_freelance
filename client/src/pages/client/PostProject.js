import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import projectService from '../../services/projectService';

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

const PostProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'web-development',
    skills: '',
    budget: { min: '', max: '' },
    deadline: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'budgetMin') {
      setFormData((prev) => ({
        ...prev,
        budget: { ...prev.budget, min: value },
      }));
    } else if (name === 'budgetMax') {
      setFormData((prev) => ({
        ...prev,
        budget: { ...prev.budget, max: value },
      }));
    } else if (name === 'skills') {
      setFormData((prev) => ({ ...prev, skills: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const data = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skills: skillsArray,
        budget: {
          min: Number(formData.budget.min),
          max: Number(formData.budget.max),
        },
        deadline: formData.deadline,
      };
      const res = await projectService.createProject(data);
      const result = res.data?.data ?? res.data;
      if (res.data?.success !== false && result) {
        toast.success('Project posted successfully!');
        navigate('/client/dashboard');
      } else {
        toast.error(res.data?.message || 'Failed to create project');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="form-page" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        Post a New Project
      </h1>
      <div className="form-card" style={{ padding: '2rem', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Project title"
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe your project in detail"
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/-/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="skills" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Skills (comma-separated)
            </label>
            <input
              id="skills"
              name="skills"
              type="text"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, UI/UX"
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
          <div style={{ marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="budgetMin" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Min Budget ($)
              </label>
              <input
                id="budgetMin"
                name="budgetMin"
                type="number"
                min={0}
                value={formData.budget.min}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label htmlFor="budgetMax" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Max Budget ($)
              </label>
              <input
                id="budgetMax"
                name="budgetMax"
                type="number"
                min={0}
                value={formData.budget.max}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="deadline" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Deadline
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              min={minDate}
              value={formData.deadline}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Posting...' : 'Post Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostProject;
