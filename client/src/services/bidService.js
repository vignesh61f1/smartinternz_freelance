import api from './api';

const bidService = {
  createBid: (data) => api.post('/bids', data),
  getProjectBids: (projectId) => api.get(`/bids/project/${projectId}`),
  getMyBids: () => api.get('/bids/my'),
  acceptBid: (bidId) => api.put(`/bids/${bidId}/accept`),
  withdrawBid: (bidId) => api.put(`/bids/${bidId}/withdraw`),
};

export default bidService;
