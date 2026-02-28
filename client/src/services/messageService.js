import api from './api';

const messageService = {
  sendMessage: (data) => api.post('/messages', data),
  getProjectMessages: (projectId) => api.get(`/messages/project/${projectId}`),
  getConversations: () => api.get('/messages/conversations'),
};

export default messageService;
