import api from "./api";

export const listarUsuarios = async () => {
  const res = await api.get("usuarios/");
  return res.data;
};

export const criarUsuario = async (dados) => {
  const res = await api.post("usuarios/", dados);
  return res.data;
};

export const atualizarUsuario = async (id, dados) => {
  const res = await api.put(`usuarios/${id}/`, dados);
  return res.data;
};

export const deletarUsuario = async (id) => {
  const res = await api.delete(`usuarios/${id}/`);
  return res.data;
};
