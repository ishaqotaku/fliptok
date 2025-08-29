import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);

// Videos
export const listVideos = (params) => api.get('/videos', { params });
export const getVideo = (id) => api.get(`/videos/${id}`);
export const uploadVideo = (formData, onUploadProgress) =>
  api.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
export const addComment = (id, data) => api.post(`/videos/${id}/comment`, data);
export const addRating = (id, data) => api.post(`/videos/${id}/rating`, data);

export default api;