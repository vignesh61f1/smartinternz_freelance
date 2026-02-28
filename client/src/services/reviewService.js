import api from './api';

const reviewService = {
  createReview: (data) => api.post('/reviews', data),
  getProjectReviews: (projectId) => api.get(`/reviews/project/${projectId}`),
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
};

export default reviewService;
