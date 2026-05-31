import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  verifyRegistration: (data) => api.post('/auth/verify-registration', data),
  resendRegistrationOtp: (email) => api.post('/auth/resend-registration-otp', { email }),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/password', data),
  requestOtp:    (email) => api.post('/auth/forgot-password', { email }),
  verifyOtp:     (data)  => api.post('/auth/verify-otp', data),
  resetPassword: (data)  => api.post('/auth/reset-password', data),
};

export const userService = {
  getProfile:    ()     => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar:  (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.put('/users/avatar', form);
  },
  removeAvatar: () => api.delete('/users/avatar'),
  deleteProfile: () => api.delete('/users/profile'),
};

export const diagnosisService = {
  upload: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/diagnoses/upload', form);
  },
  getHistory:  (params) => api.get('/diagnoses/history', { params }),
  getDiagnosis: (id)    => api.get(`/diagnoses/${id}`),
  deleteDiagnosis: (id) => api.delete(`/diagnoses/${id}`),
};

export const forumService = {
  getThreads:    (params) => api.get('/forum/threads', { params }),
  getThread:     (id)     => api.get(`/forum/threads/${id}`),
  createThread:  (data, image) => {
    if (image) {
      const form = new FormData();
      form.append('title', data.title);
      form.append('content', data.content);
      form.append('category', data.category || 'umum');
      form.append('tags', JSON.stringify(data.tags || []));
      form.append('image', image);
      return api.post('/forum/threads', form);
    }
    return api.post('/forum/threads', data);
  },
  updateThread:  (id, data) => api.put(`/forum/threads/${id}`, data),
  deleteThread:  (id)     => api.delete(`/forum/threads/${id}`),
  createComment: (threadId, data) => api.post(`/forum/threads/${threadId}/comments`, data),
  deleteComment: (id)     => api.delete(`/forum/comments/${id}`),
  getUserThreads:  (userId) => api.get('/forum/threads', { params: { user_id: userId, limit: 50 } }),
  getUserComments: (userId) => api.get(`/forum/comments/by-user/${userId}`),
  getMyThreads:  () => api.get('/forum/my-threads'),
  getMyComments: () => api.get('/forum/my-comments'),
};

export const reportService = {
  create: (data) => api.post('/reports', data),
};

export const adminService = {
  getStats:       ()         => api.get('/admin/stats'),
  getUsers:       (params)   => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  banUser:        (id, is_banned) => api.put(`/admin/users/${id}/ban`, { is_banned }),
  deleteUser:     (id)       => api.delete(`/admin/users/${id}`),
  getPosts:       (params)   => api.get('/admin/posts', { params }),
  pinPost:        (id, is_pinned) => api.put(`/admin/posts/${id}/pin`, { is_pinned }),
  deletePost:     (id)       => api.delete(`/admin/posts/${id}`),
  getReports:     (params)   => api.get('/reports', { params }),
  updateReport:   (id, status) => api.put(`/reports/${id}`, { status }),
  // Disease management
  getDiseases:    ()         => api.get('/admin/diseases'),
  createDisease:  (data)     => api.post('/admin/diseases', data),
  updateDisease:  (id, data) => api.put(`/admin/diseases/${id}`, data),
  deleteDisease:  (id)       => api.delete(`/admin/diseases/${id}`),
};
