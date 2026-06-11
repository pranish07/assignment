import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh?refresh_token=${refreshToken}`);
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          client.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
          return client(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const { data } = await client.post('/auth/login', formData);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  },
  getMe: async () => {
    const { data } = await client.get('/auth/me');
    return data;
  }
};

export const candidatesApi = {
  list: async (params) => {
    const { data } = await client.get('/candidates/', { params });
    return data;
  },
  get: async (id) => {
    const { data } = await client.get(`/candidates/${id}`);
    return data;
  },
  addScore: async (id, scoreData) => {
    const { data } = await client.post(`/candidates/${id}/scores`, scoreData);
    return data;
  },
  triggerSummary: async (id) => {
    const { data } = await client.post(`/candidates/${id}/summary`);
    return data;
  },
  update: async (id, updateData) => {
    const { data } = await client.patch(`/candidates/${id}`, updateData);
    return data;
  },
  delete: async (id) => {
    const { data } = await client.delete(`/candidates/${id}`);
    return data;
  }
};

export default client;
