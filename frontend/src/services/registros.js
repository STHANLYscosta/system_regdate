import api from './api';

// Criar novo registro (mantém como já está)
export const criarRegistro = async (dados) => {
  try {
    const response = await api.post('registrar/', dados);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Listar registros com paginação + filtros
export const listarRegistros = async (page = 1, filtros = {}) => {
  try {
    const params = {
      page,
      ...filtros,   // tipo, cartao, cpf, data_ini, data_fim, etc.
    };

    const response = await api.get('registros/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Buscar um registro específico (detalhes)
export const listarRegistroPorId = async (id) => {
  try {
    const response = await api.get(`registros/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
