import api from './api';

// Criar novo registro (qualquer tipo de atendimento)
export const criarRegistro = async (dados) => {
  try {
    const response = await api.post('/registrar/', dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Listar registros com paginação
export const listarRegistros = async (page = 1) => {
  try {
    const response = await api.get('/registros/', {
      params: { page }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
