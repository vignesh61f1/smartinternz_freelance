import api from './api';

const submissionService = {
  createSubmission: (data) => api.post('/submissions', data),
  getProjectSubmissions: (projectId) =>
    api.get(`/submissions/project/${projectId}`),
  reviewSubmission: (id, data) => api.put(`/submissions/${id}/review`, data),
};

export default submissionService;
