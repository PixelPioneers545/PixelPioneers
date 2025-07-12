import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    if (response.data.success) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Questions API calls
export const questionsAPI = {
  getAll: async (page = 1, limit = 10, filter = 'newest') => {
    const response = await api.post('/db/getQuestions', {
      filter: filter,
      limit: limit,
      skip: (page - 1) * limit
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.post('/db/getQuestions', {
      id: parseInt(id),
      includeAnswers: true
    });
    return response.data;
  },

  create: async (questionData) => {
    const response = await api.post('/questions', questionData);
    return response.data;
  },

  update: async (id, questionData) => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
  },

  vote: async (id, direction, userId) => {
    const response = await api.post(`/questions/${id}/vote`, { direction, userId });
    return response.data;
  }
};

// Answers API calls
export const answersAPI = {
  create: async (questionId, answerData) => {
    const response = await api.post(`/questions/${questionId}/answers`, answerData);
    return response.data;
  },

  update: async (questionId, answerId, answerData) => {
    const response = await api.put(`/questions/${questionId}/answers/${answerId}`, answerData);
    return response.data;
  },

  delete: async (questionId, answerId) => {
    const response = await api.delete(`/questions/${questionId}/answers/${answerId}`);
    return response.data;
  },

  vote: async (questionId, answerId, direction, userId) => {
    const response = await api.post(`/questions/${questionId}/answers/${answerId}/vote`, { direction, userId });
    return response.data;
  },

  accept: async (questionId, answerId, userId) => {
    const response = await api.post(`/questions/${questionId}/answers/${answerId}/accept`, { userId });
    return response.data;
  }
};

// Tags API calls
export const tagsAPI = {
  getAll: async () => {
    const response = await api.get('/db/getAllTags');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/db/getTagById/${id}`);
    return response.data;
  }
};

// Search API calls
export const searchAPI = {
  questions: async (query, page = 1, limit = 10) => {
    const response = await api.post('/search/questions', {
      query,
      page,
      limit
    });
    return response.data;
  }
};

export default api; 