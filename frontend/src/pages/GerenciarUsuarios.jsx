import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getUserRole, logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const GerenciarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [postos, setPostos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [msg, setMsg] = useState({ texto: '', erro: false });
  const navigate = useNavigate();

  const userRole = getUserRole();
  const isGerente = userRole === 'GERENTE';

  // Filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroPosto, setFiltroPosto] = useState('');

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
    if (!formData.nome_completo || !formData.login || !formData.cpf || !formData.posto_id) return;
    
    setMsg({ texto: 'Carregando...', erro: false });
    
    let path = 'usuarios/';
    let method = 'post';
    let payload = { ...formData };
    
    if (editandoId) {
       path = `usuarios/`;
       method = 'put';
       payload.id = editandoId;
       if (!formData.resetar_senha) delete payload.resetar_senha;
       delete payload.cpf; 
    } else {
       payload.senha = formData.cpf;
       delete payload.resetar_senha;
    }

    try {
      await api[method](path, payload);
      setMsg({ texto: editandoId ? 'Atendente atualizado com sucesso!' : 'Novo atendente registrado.', erro: false });
      setShowModal(false);
      carregarDados();
      setTimeout(() => setMsg({ texto: '', erro: false }), 4000);
    } catch (err) {
      const errorMsg = err.response?.data?.erro || "Erro na validação do banco de dados.";
      setMsg({ texto: `Erro: ${errorMsg}`, erro: true });
    }
  };

  const handleTransferir = async (userId, postoId) => {
    if (!postoId || !isGerente) return;
    try {
      await api.post(`usuarios/transferir/`, { usuario_id: userId, novo_posto_id: parseInt(postoId) });
      setMsg({ texto: 'Usuário transferido com sucesso!', erro: false });
      carregarDados();
      setTimeout(() => setMsg({ texto: '', erro: false }), 3000);
    } catch (err) {
      setMsg({ texto: 'Não foi possível autorizar transferência.', erro: true });
    }
  };

  const usuariosFiltrados = usuarios.filter(u => {
    const search = filtroNome.toLowerCase();
    const matchNome = (u.nome_completo && u.nome_completo.toLowerCase().includes(search)) || 
                      (u.username && u.username.toLowerCase().includes(search));
    const matchStatus = filtroStatus === '' ? true : String(u.is_active ? 1 : 0) === filtroStatus;
    const matchNivel = filtroNivel === '' ? true : u.nivel_acesso === filtroNivel;
    const matchPosto = filtroPosto === '' ? true : filtroPosto === 'null' ? u.posto_atual_id === null : String(u.posto_atual_id) === filtroPosto;
    
    return matchNome && matchStatus && matchNivel && matchPosto;
  });

  return (
    <div className="min-h-screen page-bg pb-12">
      {/* Header Fixo */}
      <header className="app-header">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()}
              className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95 group"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" style={{ color: 'var(--teal-300)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <img src="/src/assets/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" onError={(e) => e.target.style.display='none'} />
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Gerenciamento de Equipe
            </h1>
          </div>
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8">
        
        {msg.texto && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center gap-3 animate-fade-up ${
            msg.erro 
              ? 'bg-red-500/10 text-red-300 border-red-500/20' 
              : 'bg-[var(--teal-500)]/10 text-[var(--teal-300)] border-[var(--teal-500)]/20'
          }`}>
            <span>{msg.texto}</span>
          </div>
        )}

        {/* Toolbar Topo */}
        <div className="flex flex-col xl:flex-row justify-between items-end gap-3 mb-6">
          <div className="w-full xl:w-auto flex-1 max-w-4xl bg-[var(--dark-800)] p-4 rounded-2xl border border-white/5 flex flex-wrap lg:flex-nowrap gap-3">
            <div className="w-full lg:flex-1">
              <input type="text" className="input-dark w-full" placeholder="Buscar por Nome..." value={filtroNome} onChange={e => setFiltroNome(e.target.value)} />
            </div>
            <select className="input-dark flex-1 min-w-[140px] cursor-pointer" value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)}>
              <option value="">Cargos</option>
              <option value="ATENDENTE">Atendente</option>
              <option value="ATENDENTE_II">Atendente II</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="GERENTE">Gerente</option>
            </select>
            <select className="input-dark flex-1 min-w-[140px] cursor-pointer" value={filtroPosto} onChange={e => setFiltroPosto(e.target.value)}>
              <option value="">Qualquer Posto</option>
              <option value="null">Remanejado (Aulso)</option>
              {postos.map(p => <option key={p.id} value={p.id}>{p.nome_posto}</option>)}
            </select>
            <select className="input-dark flex-1 min-w-[120px] cursor-pointer" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
              <option value="">Acessos</option>
              <option value="1">Ativos</option>
              <option value="0">Revogados</option>
            </select>
          </div>
          
          {isGerente && (
            <button onClick={() => handleAbrirModal()} className="btn-primary flex items-center gap-2 shrink-0 py-3.5 whitespace-nowrap">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Novo Colaborador
            </button>
          )}
        </div>

        {/* Tabela de Equipe */}
        <div className="card-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[var(--dark-800)] border-b border-white/5">
                <tr>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--teal-400)]">Identificação Pessoal</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--teal-400)]">Atribuição de Cargo</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--teal-400)]">Lotação (Posto Fixo)</th>
                  {isGerente && <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--teal-400)] text-center">Gestão Direta</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usuariosFiltrados.length > 0 ? usuariosFiltrados.map((u) => (
                  <tr key={u.id} className={`hover:bg-white/5 transition-colors group ${!u.is_active ? 'opacity-40 grayscale' : ''}`}>
                    <td className="p-4">
                      <div className="font-bold text-white text-base drop-shadow-sm">{u.nome_completo}</div>
                      <div className="text-xs text-[var(--teal-300)] mt-0.5">
                        @{u.username} <span className="text-[var(--color-text-muted)] mx-1">|</span> <span className="text-[var(--color-text-secondary)] tracking-wider">CPF: {u.cpf}</span>
                      </div>
                    </td>
                    <td className="p-4">
                       <div className="flex flex-col gap-1.5 items-start">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                           u.nivel_acesso === 'GERENTE' ? 'bg-purple-900/40 text-purple-300 border border-purple-800/50' : 
                           u.nivel_acesso === 'SUPERVISOR' ? 'bg-indigo-900/40 text-indigo-300 border border-indigo-800/50' :
                           'badge-teal border-transparent bg-[var(--teal-500)]/20'
                         }`}>
                           {u.nivel_acesso.replace('_', ' ')}
                         </span>
                         <span className="text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full"
                           style={{ 
                             borderColor: u.is_active ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)',
                             color: u.is_active ? '#4ade80' : '#f87171',
                             background: u.is_active ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)'
                           }}>
                           {u.is_active ? 'Acesso Livre' : 'Bloqueado'}
                         </span>
                       </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                        {u.posto_atual || <em className="opacity-50 underline decoration-dotted">Base Compartilhada</em>}
                      </span>
                    </td>
                    {isGerente && (
                      <td className="p-4">
                         <div className="flex items-center gap-2 justify-center">
                           <select 
                             className="w-full min-w-[140px] max-w-[160px] p-2 text-xs border border-white/10 rounded-lg bg-[var(--dark-800)] text-white/80 cursor-pointer outline-none focus:ring-1 focus:ring-[var(--teal-500)]"
                             onChange={(e) => handleTransferir(u.id, e.target.value)}
                             value=""
                           >
                             <option value="" disabled className="text-white/50">Mover Servidor...</option>
                             {postos.map(p => (
                               <option key={p.id} value={p.id}>{p.nome_posto}</option>
                             ))}
                           </select>
                           <button onClick={() => handleAbrirModal(u)} className="p-2 rounded-lg bg-white/5 hover:bg-[var(--teal-600)] transition text-[var(--teal-300)] hover:text-white" title="Editar Ficha">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                             </svg>
                           </button>
                         </div>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                     <td colSpan={isGerente ? "4" : "3"} className="p-10 text-center text-[var(--color-text-muted)]">
                       Sem membros na equipe correspondendo aos filtros inseridos.
                     </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal - Cadastrar/Editar V2 (Glasmorphism) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-up">
          <div className="glass-dark rounded-3xl max-w-xl w-full p-8 shadow-2xl relative border-t border-[var(--teal-500)]">
            
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-[var(--color-text-muted)] hover:text-white transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h2 className="text-2xl font-black mb-6" style={{ color: 'var(--color-text-primary)' }}>
              {editandoId ? 'Atualizar Colaborador' : 'Novo Recrutamento'}
            </h2>
            
            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                 <label className="label-dark">Nome Completo *</label>
                 <input className="input-dark py-2.5" placeholder="Nome Legal do Cidadão" value={formData.nome_completo} required onChange={e => setFormData({...formData, nome_completo: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="label-dark">Credencial de Login *</label>
                   <input className="input-dark py-2.5" placeholder="usuario.sistema" value={formData.login} required onChange={e => setFormData({...formData, login: e.target.value})} />
                </div>
                <div>
                  <label className="label-dark">Matrícula</label>
                  <input className="input-dark py-2.5" placeholder="Opcional" value={formData.matricula} onChange={e => setFormData({...formData, matricula: e.target.value})} />
                </div>
              </div>

              {!editandoId && (
                <div>
                  <label className="label-dark">CPF Numérico * <span className="text-[var(--teal-300)] opacity-80 font-normal lowercase">(Será a senha inicial)</span></label>
                  <input className="input-dark py-2.5" placeholder="Apenas dígitos" value={formData.cpf} required onChange={e => setFormData({...formData, cpf: e.target.value})} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="label-dark">Direitos e Permissões *</label>
                   <select className="input-dark py-2.5 cursor-pointer" value={formData.nivel_acesso} onChange={e => setFormData({...formData, nivel_acesso: e.target.value})}>
                     <option value="ATENDENTE">Atendente</option>
                     <option value="ATENDENTE_II">Atendente II</option>
                     <option value="SUPERVISOR">Supervisor</option>
                     <option value="GERENTE">Gerente/Admin</option>
                   </select>
                </div>
                <div>
                  <label className="label-dark">Estado da Credencial *</label>
                  <select className="input-dark py-2.5 cursor-pointer" value={formData.is_active ? '1' : '0'} onChange={e => setFormData({...formData, is_active: e.target.value === '1'})}>
                     <option value="1">Liberado</option>
                     <option value="0">Suspenso</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-dark">Lotação (Posto-Base) *</label>
                <select className="input-dark py-2.5 cursor-pointer" value={formData.posto_id} required onChange={e => setFormData({...formData, posto_id: e.target.value})}>
                  <option value="">Direcionar para base...</option>
                  {postos.map(p => <option key={p.id} value={p.id}>{p.nome_posto}</option>)}
                </select>
              </div>
              
              {editandoId && (
                <div className="flex items-start gap-3 mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <div className="pt-0.5">
                    <input type="checkbox" id="resetar_senha" checked={formData.resetar_senha} onChange={e => setFormData({...formData, resetar_senha: e.target.checked})} 
                           className="w-4 h-4 text-red-500 rounded border-[var(--dark-800)] bg-[var(--dark-900)] cursor-pointer" />
                  </div>
                  <label htmlFor="resetar_senha" className="text-sm font-medium text-red-300 cursor-pointer">
                    Revogar a senha atual do colaborador e forçar a utilização do CPF numérico no próximo acesso obrigatório.
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-5">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-[var(--dark-800)] text-white/70 rounded-xl font-bold hover:bg-black/40 transition">Cancelar Operação</button>
                <button type="submit" className="flex-1 py-3 btn-primary text-center">Aprovar Ficha Institucional</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GerenciarUsuarios;