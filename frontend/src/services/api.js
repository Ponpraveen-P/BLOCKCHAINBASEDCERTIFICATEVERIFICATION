import axios from 'axios';

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_URL = import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Module
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Student Module
export const studentService = {
  getAll: async (page = 1, limit = 10, search = '') => {
    const response = await api.get(`/students?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },
  create: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },
  update: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  }
};

// Certificate Module
export const certificateService = {
  generate: async (studentId, grade) => {
    const response = await api.post('/certificates', { studentId, grade });
    return response.data;
  },
  getAll: async (page = 1, limit = 10, search = '') => {
    const response = await api.get(`/certificates?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/certificates/${id}`);
    return response.data;
  },
  getByStudent: async (studentId) => {
    const response = await api.get(`/certificates/student/${studentId}`);
    return response.data;
  }
};

// Blockchain Module
export const blockchainService = {
  getChain: async () => {
    const response = await api.get('/blockchain');
    return response.data;
  },
  validate: async () => {
    const response = await api.post('/blockchain/validate');
    return response.data;
  }
};

// Verification Module
export const verificationService = {
  verifyById: async (id) => {
    const response = await api.get(`/verification/id/${id}`);
    return response.data;
  },
  verifyByFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/verification/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Reports Module
export const reportsService = {
  getStats: async () => {
    const response = await api.get('/reports/stats');
    return response.data;
  }
};

export default api;
