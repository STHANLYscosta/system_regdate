import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getUserRole } from '../services/auth';

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [postos, setPostos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [msg, setMsg] = useState({ texto: '', erro: false });

  // Pega o papel local
  const userRole = getUserRole();
  const isGerente = userRole === 'GERENTE';

  // Filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroPosto, setFiltroPosto] = useState('');

  // Estados para Criação/Edição
  const [formData, setFormData] = useState({
    login: '', nome_completo: '', cpf: '', matricula: '', nivel_acesso: 'ATENDENTE', posto_id: '', is_active: true, resetar_senha: false
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resUsers, resPostos] = await Promise.all([
        api.get('usuarios/'),
        api.get('postos/')
      ]);
      setUsuarios(resUsers.data);
      setPostos(resPostos.data);
    } catch (err) {
      setMsg({ texto: 'Erro ao carregar dados.', erro: true });
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModal = (usuario = null) => {
    if (!isGerente) return;
    if (usuario) {
      setEditandoId(usuario.id);
      setFormData({
        login: usuario.username || '', 
        nome_completo: usuario.nome_completo || '', 
        cpf: usuario.cpf || '', 
        matricula: usuario.matricula || '', 
        nivel_acesso: usuario.nivel_acesso || 'ATENDENTE', 
        posto_id: usuario.posto_atual_id || '',
        is_active: usuario.is_active ?? true,
        resetar_senha: false
      });
    } else {
      setEditandoId(null);
      setFormData({
        login: '', nome_completo: '', cpf: '', matricula: '', nivel_acesso: 'ATENDENTE', posto_id: '', is_active: true, resetar_senha: false
      });
    }
    setShowModal(true);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put('usuarios/', { id: editandoId, ...formData });
        setMsg({ texto: 'Usuário atualizado com sucesso!', erro: false });
      } else {
        await api.post('usuarios/', formData);
        setMsg({ texto: 'Usuário cadastrado com sucesso!', erro: false });
      }
      setShowModal(false);
      carregarDados();
    } catch (err) {
      setMsg({ texto: err.response?.data?.erro || 'Erro ao salvar.', erro: true });
    }
  };

  const handleTransferir = async (usuarioId, novoPostoId) => {
    if (!novoPostoId || !isGerente) return;
    try {
      await api.post('usuarios/transferir/', { usuario_id: usuarioId, novo_posto_id: novoPostoId });
      setMsg({ texto: 'Transferência realizada!', erro: false });
      carregarDados();
    } catch (err) {
      setMsg({ texto: 'Erro na transferência.', erro: true });
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  const usuariosFiltrados = usuarios.filter(u => {
    const matchNome = u.nome_completo.toLowerCase().includes(filtroNome.toLowerCase()) || String(u.username).toLowerCase().includes(filtroNome.toLowerCase());
    const matchStatus = filtroStatus ? (filtroStatus === '1' ? u.is_active : !u.is_active) : true;
    const matchNivel = filtroNivel ? u.nivel_acesso === filtroNivel : true;
    const matchPosto = filtroPosto ? String(u.posto_atual_id) === String(filtroPosto) : true;
    return matchNome && matchStatus && matchNivel && matchPosto;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => window.history.back()}
             className="p-2 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 shadow-sm transition-colors group"
           >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
           </button>
           <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Equipe</h1>
        </div>
        {isGerente && (
          <button 
            onClick={() => handleAbrirModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            + Novo Atendente
          </button>
        )}
      </div>

      {msg.texto && (
        <div className={`p-4 mb-4 rounded ${msg.erro ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {msg.texto}
        </div>
      )}

      {/* FILTROS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Lista de Usuários</h2>
            <span className="bg-blue-100 text-blue-700 py-0.5 px-2.5 rounded-full text-sm font-medium">
              {usuariosFiltrados.length}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="pl-10 w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                placeholder="Pesquisar por nome ou login..."
                value={filtroNome}
                onChange={e => setFiltroNome(e.target.value)}
              />
            </div>
            
            <select 
              className="p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filtroNivel}
              onChange={e => setFiltroNivel(e.target.value)}
            >
              <option value="">Qualquer Cargo</option>
              <option value="ATENDENTE">Atendente</option>
              <option value="ATENDENTE_II">Atendente II</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="GERENTE">Gerente</option>
            </select>

            <select 
              className="p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filtroPosto}
              onChange={e => setFiltroPosto(e.target.value)}
            >
              <option value="">Qualquer Posto</option>
              <option value="null">Sem Posto</option>
              {postos.map(p => (
                 <option key={p.id} value={p.id}>{p.nome_posto}</option>
              ))}
            </select>
            
            <select 
              className="p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
            >
              <option value="">Status</option>
              <option value="1">Ativos</option>
              <option value="0">Inativos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Usuário</th>
                <th className="p-4 font-semibold text-gray-600">Cargo / Status</th>
                <th className="p-4 font-semibold text-gray-600">Posto Atual</th>
                {isGerente && <th className="p-4 font-semibold text-gray-600 text-center">Ações / Transferência</th>}
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length > 0 ? usuariosFiltrados.map((u) => (
                <tr key={u.id} className={`border-b hover:bg-gray-50 transition border-gray-50 ${!u.is_active ? 'opacity-60' : ''}`}>
                  <td className="p-4">
                    <div className="font-medium text-gray-900 line-clamp-1" title={u.nome_completo}>{u.nome_completo}</div>
                    <div className="text-xs text-gray-500">@{u.username} | CPF: {u.cpf}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                        u.nivel_acesso === 'GERENTE' ? 'bg-purple-100 text-purple-700' : 
                        u.nivel_acesso === 'SUPERVISOR' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {u.nivel_acesso.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${u.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {u.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-gray-700">{u.posto_atual || <em className="text-gray-400">Sem Posto</em>}</span>
                  </td>
                  {isGerente && (
                    <td className="p-4 flex items-center gap-2 justify-center">
                      <select 
                        className="w-full max-w-[130px] p-2 text-xs border rounded bg-white shadow-sm"
                        onChange={(e) => handleTransferir(u.id, e.target.value)}
                        value=""
                      >
                        <option value="">Transferir...</option>
                        {postos.map(p => (
                          <option key={p.id} value={p.id}>{p.nome_posto}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => handleAbrirModal(u)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition"
                        title="Editar Usuário"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                   <td colSpan={isGerente ? "4" : "3"} className="p-12 text-center text-gray-500">
                     Nenhum funcionário encontrado.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editandoId ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}</h2>
            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                 <input type="text" placeholder="Nome" value={formData.nome_completo} required className="w-full p-2 border rounded" onChange={e => setFormData({...formData, nome_completo: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Login *</label>
                   <input type="text" placeholder="Usuário" value={formData.login} required className="w-full p-2 border rounded" onChange={e => setFormData({...formData, login: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
                  <input type="text" placeholder="Opcional" value={formData.matricula} className="w-full p-2 border rounded" onChange={e => setFormData({...formData, matricula: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF * (Primeira senha)</label>
                <input type="text" placeholder="Apenas números ou formato" value={formData.cpf} required className="w-full p-2 border rounded" onChange={e => setFormData({...formData, cpf: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Acesso *</label>
                   <select className="w-full p-2 border rounded" value={formData.nivel_acesso} onChange={e => setFormData({...formData, nivel_acesso: e.target.value})}>
                     <option value="ATENDENTE">Atendente</option>
                     <option value="ATENDENTE_II">Atendente II</option>
                     <option value="SUPERVISOR">Supervisor</option>
                     <option value="GERENTE">Gerente</option>
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status (Acesso) *</label>
                  <select className="w-full p-2 border rounded bg-white shadow-sm" value={formData.is_active ? '1' : '0'} onChange={e => setFormData({...formData, is_active: e.target.value === '1'})}>
                     <option value="1">Ativo (Pode logar)</option>
                     <option value="0">Inativo (Bloqueado)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posto de Lotação *</label>
                <select className="w-full p-2 border rounded" value={formData.posto_id} required onChange={e => setFormData({...formData, posto_id: e.target.value})}>
                  <option value="">Selecionar Posto...</option>
                  {postos.map(p => <option key={p.id} value={p.id}>{p.nome_posto}</option>)}
                </select>
              </div>
              
              {editandoId && (
                <div className="flex items-center gap-2 mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <input type="checkbox" id="resetar_senha" checked={formData.resetar_senha} onChange={e => setFormData({...formData, resetar_senha: e.target.checked})} className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300" />
                  <label htmlFor="resetar_senha" className="text-sm font-medium text-red-800 cursor-pointer">Forçar reset da senha para o CPF na próxima tentativa</label>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow-md md:shadow-blue-500/30">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerenciarUsuarios;