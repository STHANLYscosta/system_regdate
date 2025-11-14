import axios from 'axios';

// URL base da API
const API_URL = "http://127.0.0.1:8000/api/";

// Cria instância do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de REQUEST - Adiciona o token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token_access");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de RESPONSE - Trata erros de autenticação
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se o token expirou (401), redireciona para login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token_access");
      localStorage.removeItem("token_refresh");
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default api;