import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/password', data),
};

export const userService = {
  getProfile:    ()     => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar:  (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.put('/users/avatar', form);
  },
};

export const diagnosisService = {
  upload: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/diagnoses/upload', form);
  },
  getHistory:  (params) => api.get('/diagnoses/history', { params }),
  getDiagnosis: (id)    => api.get(`/diagnoses/${id}`),
};

export const forumService = {
  getThreads:    (params) => api.get('/forum/threads', { params }),
  getThread:     (id)     => api.get(`/forum/threads/${id}`),
  createThread:  (data)   => api.post('/forum/threads', data),
  updateThread:  (id, data) => api.put(`/forum/threads/${id}`, data),
  deleteThread:  (id)     => api.delete(`/forum/threads/${id}`),
  createComment: (threadId, data) => api.post(`/forum/threads/${threadId}/comments`, data),
  deleteComment: (id)     => api.delete(`/forum/comments/${id}`),
};

export const reportService = {
  create: (data) => api.post('/reports', data),
};

export const adminService = {
  getStats:       ()         => api.get('/admin/stats'),
  getUsers:       (params)   => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  banUser:        (id, is_banned) => api.put(`/admin/users/${id}/ban`, { is_banned }),
  getPosts:       (params)   => api.get('/admin/posts', { params }),
  pinPost:        (id, is_pinned) => api.put(`/admin/posts/${id}/pin`, { is_pinned }),
  deletePost:     (id)       => api.delete(`/admin/posts/${id}`),
  getReports:     (params)   => api.get('/reports', { params }),
  updateReport:   (id, status) => api.put(`/reports/${id}`, { status }),
};
