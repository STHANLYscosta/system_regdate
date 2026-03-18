import api from './api';

export const trocarSenhaPrimeiroAcesso = async (login_str, senha_atual, nova_senha) => {
  const response = await api.post('primeiro-acesso/', {
    login: login_str,
    senha_atual,
    nova_senha
  });
  return response.data;
};

export const login = async (username, password) => {
  try {
    // Note que usamos 'login/' para bater na nossa rota do Django (baseURL já tem /api/)
    const response = await api.post('login/', {
      login: username,
      senha: password,
    });
    
    if (response.data.token_access) {
      localStorage.setItem("token_access", response.data.token_access);
      localStorage.setItem("token_refresh", response.data.token_refresh);
      localStorage.setItem("nivel_acesso", response.data.nivel_acesso); 
    }
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 403 && error.response.data?.require_password_change) {
      throw new Error("PRIMEIRO_ACESSO");
    }
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token_access");
  localStorage.removeItem("token_refresh");
  localStorage.removeItem("nivel_acesso");
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token_access');
  return token !== null && token !== "undefined" && token !== "";
};

// ESTA É A FUNÇÃO QUE RESOLVE O SEU ERRO:
export const getUserRole = () => {
  return localStorage.getItem('nivel_acesso');
};