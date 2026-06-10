import axios from 'axios';

const API_URL = 'http://localhost:8000';

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

export const authApi = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const { data } = await client.post('/auth/login', formData);
    localStorage.setItem('token', data.access_token);
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
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
  }
};

export default client;
