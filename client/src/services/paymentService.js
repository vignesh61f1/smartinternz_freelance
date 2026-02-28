import api from './api';

const paymentService = {
  createPayment: (data) => api.post('/payments', data),
  getProjectPayments: (projectId) => api.get(`/payments/project/${projectId}`),
  getMyPayments: () => api.get('/payments/my'),
};

export default paymentService;
