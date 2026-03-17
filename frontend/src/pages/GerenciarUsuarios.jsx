import React, { useState, useEffect } from 'react';
import api from '../services/api';

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [postos, setPostos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [msg, setMsg] = useState({ texto: '', erro: false });

  // Estados para Criação/Edição
  const [formData, setFormData] = useState({
    login: '', nome_completo: '', cpf: '', matricula: '', nivel_acesso: 'ATENDENTE', posto_id: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resUsers, resPostos] = await Promise.all([
        api.get('api/usuarios/'),
        api.get('api/postos/')
      ]);
      setUsuarios(resUsers.data);
      setPostos(resPostos.data);
    } catch (err) {
      setMsg({ texto: 'Erro ao carregar dados.', erro: true });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('api/usuarios/', formData);
      setMsg({ texto: 'Usuário cadastrado com sucesso!', erro: false });
      setShowModal(false);
      carregarDados(); // Atualiza a lista
    } catch (err) {
      setMsg({ texto: err.response?.data?.erro || 'Erro ao criar.', erro: true });
    }
  };

  const handleTransferir = async (usuarioId, novoPostoId) => {
    if (!novoPostoId) return;
    try {
      await api.post('api/usuarios/transferir/', { usuario_id: usuarioId, novo_posto_id: novoPostoId });
      setMsg({ texto: 'Transferência realizada!', erro: false });
      carregarDados();
    } catch (err) {
      setMsg({ texto: 'Erro na transferência.', erro: true });
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Equipe</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Novo Atendente
        </button>
      </div>

      {msg.texto && (
        <div className={`p-4 mb-4 rounded ${msg.erro ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {msg.texto}
        </div>
      )}

      {/* TABELA DE USUÁRIOS */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Nome / Login</th>
              <th className="p-4 font-semibold text-gray-600">Nível</th>
              <th className="p-4 font-semibold text-gray-600">Posto Atual</th>
              <th className="p-4 font-semibold text-gray-600 text-center">Ações / Transferência</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{u.nome_completo}</div>
                  <div className="text-xs text-gray-500">@{u.username} | CPF: {u.cpf}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    u.nivel_acesso === 'GERENTE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {u.nivel_acesso}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-gray-700">{u.posto_atual || 'Sem Posto'}</span>
                </td>
                <td className="p-4">
                  <select 
                    className="w-full p-2 text-sm border rounded bg-gray-50"
                    onChange={(e) => handleTransferir(u.id, e.target.value)}
                    value=""
                  >
                    <option value="">Mudar Posto...</option>
                    {postos.map(p => (
                      <option key={p.id} value={p.id}>{p.nome_posto}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CADASTRO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Cadastrar Novo Funcionário</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Nome Completo" required className="w-full p-2 border rounded" onChange={e => setFormData({...formData, nome_completo: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Login (Usuário)" required className="w-full p-2 border rounded" onChange={e => setFormData({...formData, login: e.target.value})} />
                <input type="text" placeholder="Matrícula" className="w-full p-2 border rounded" onChange={e => setFormData({...formData, matricula: e.target.value})} />
              </div>
              <input type="text" placeholder="CPF (Será a senha inicial)" required className="w-full p-2 border rounded" onChange={e => setFormData({...formData, cpf: e.target.value})} />
              <select className="w-full p-2 border rounded" onChange={e => setFormData({...formData, nivel_acesso: e.target.value})}>
                <option value="ATENDENTE">Atendente</option>
                <option value="ATENDENTE_II">Atendente II</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="GERENTE">Gerente</option>
              </select>
              <select className="w-full p-2 border rounded" required onChange={e => setFormData({...formData, posto_id: e.target.value})}>
                <option value="">Vincular a qual Posto?</option>
                {postos.map(p => <option key={p.id} value={p.id}>{p.nome_posto}</option>)}
              </select>
              <div className="flex space-x-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-200 rounded-lg">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarUsuarios;