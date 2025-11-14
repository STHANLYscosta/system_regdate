import api from './api';

// Login - Recebe username e password, retorna tokens
export const login = async (username, password) => {
  try {
    const response = await api.post('/token/', {
      username,
      password,
    });
    
    // Salva os tokens no localStorage
    localStorage.setItem("token_access", response.data.access);
    localStorage.setItem("token_refresh", response.data.refresh);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout - Remove tokens do localStorage
export const logout = () => {
  localStorage.removeItem("token_access");
  localStorage.removeItem("token_refresh");
};

// Verifica se está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return !!token; // Retorna true se tiver token
};