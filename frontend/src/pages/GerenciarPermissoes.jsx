import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

const NIVEIS_ACESSO = [
  { value: 'GERENTE', label: 'Gerente / Gestor', colorLine: 'bg-purple-500', colorText: 'text-purple-300', colorBadge: 'bg-purple-500/20 border-purple-500/30' },
  { value: 'SUPERVISOR', label: 'Supervisor', colorLine: 'bg-indigo-500', colorText: 'text-indigo-300', colorBadge: 'bg-indigo-500/20 border-indigo-500/30' },
  { value: 'ATENDENTE_II', label: 'Atendente Nível II', colorLine: 'bg-[var(--teal-400)]', colorText: 'text-[var(--teal-300)]', colorBadge: 'bg-[var(--teal-500)]/20 border-[var(--teal-500)]/30' },
  { value: 'ATENDENTE', label: 'Atendente de Base', colorLine: 'bg-blue-400', colorText: 'text-blue-300', colorBadge: 'bg-blue-500/20 border-blue-500/30' },
];

export default function GerenciarPermissoes() {
  const [usuariosDb, setUsuariosDb] = useState([]);
  const [usuariosModificados, setUsuariosModificados] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const currentUserNivel = localStorage.getItem('nivel_acesso');
  const navigate = useNavigate();

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('usuarios/');
      setUsuariosDb(res.data);
      setUsuariosModificados({});
    } catch (err) {
      const errorMsg = err.response?.data?.erro || "Verifique sua conexão e permissões.";
      alert(`Erro ao carregar usuários: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMudarNivel = (userId, novoNivel) => {
    const user = usuariosDb.find(u => u.id === userId);
    if (!user) return;

    if (user.nivel_acesso === novoNivel) {
      const newMods = { ...usuariosModificados };
      delete newMods[userId];
      setUsuariosModificados(newMods);
    } else {
      setUsuariosModificados({
        ...usuariosModificados,
        [userId]: novoNivel
      });
    }
  };

  const handleSalvarAlteracoes = async () => {
    const itensParaSalvar = Object.entries(usuariosModificados).map(([id, nivel_acesso]) => ({
      id: parseInt(id),
      nivel_acesso
    }));

    if (itensParaSalvar.length === 0) return;

    setIsSaving(true);
    try {
      await api.put('permissoes/', { usuarios: itensParaSalvar });
      setUsuariosModificados({});
      carregarUsuarios(); 
    } catch (err) {
      const errorMsg = err.response?.data?.erro || "Falha ao salvar.";
      alert(`Erro ao salvar permissões: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (currentUserNivel !== 'GERENTE') {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center p-4">
        <div className="glass-dark p-8 rounded-3xl border border-red-500/30 text-center max-w-md w-full animate-fade-up">
          <svg className="w-16 h-16 text-red-400 drop-shadow-md mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-black text-white mb-2">Acesso Restrito</h2>
          <p className="text-[var(--color-text-secondary)] font-medium">Apenas administradores de sistema podem gerenciar a hierarquia de permissões.</p>
          <button onClick={() => window.history.back()} className="mt-6 w-full btn-primary bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white">Voltar para o Início</button>
        </div>
      </div>
    );
  }

  const groupedUsers = NIVEIS_ACESSO.map(nivel => ({
    ...nivel,
    users: usuariosDb.filter(u => {
      const currentLevel = usuariosModificados[u.id] || u.nivel_acesso;
      return currentLevel === nivel.value;
    })
  }));

  const hasChanges = Object.keys(usuariosModificados).length > 0;

  return (
    <div className="min-h-screen page-bg flex flex-col hide-scrollbar">
      {/* Header Fixo */}
      <header className="app-header z-20">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()}
              className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95 group"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-[var(--teal-300)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <img src="/src/assets/images/logo.png" alt="Logo" className="w-8 h-8 object-contain hidden sm:block" onError={(e) => e.target.style.display='none'} />
            <div>
               <h1 className="text-xl font-bold text-white leading-tight">Painel de Acessos</h1>
               <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Hierarquia visual arrastável (Kanban)</p>
            </div>
          </div>
          
          <div className="flex gap-3">
             <button 
                disabled={isSaving || isLoading}
                onClick={carregarUsuarios}
                className="px-4 py-2 bg-[var(--dark-800)] border border-white/10 hover:border-white/30 text-white/80 rounded-xl font-medium transition-all disabled:opacity-50 hidden md:block"
             >
                Restaurar
             </button>
             <button
               onClick={handleSalvarAlteracoes}
               disabled={!hasChanges || isSaving}
               className={`px-5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  hasChanges 
                  ? 'btn-primary' 
                  : 'bg-[var(--dark-900)] text-white/30 cursor-not-allowed border border-white/5'
               }`}
             >
               {isSaving ? (
                 <>
                   <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   <span className="hidden sm:block">Aplicando...</span>
                 </>
               ) : (
                 <>
                   Gravar Alterações
                   {hasChanges && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs animate-pulse">{Object.keys(usuariosModificados).length}</span>}
                 </>
               )}
             </button>
          </div>
        </div>
      </header>

      {/* Board Horizontal Kanban */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-12 h-12 border-4 border-[var(--teal-500)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex gap-6 h-full min-w-max pb-4 items-start pt-2">
            {groupedUsers.map(group => (
              <div key={group.value} className="w-80 flex flex-col glass-dark border border-white/5 rounded-2xl overflow-hidden shadow-2xl h-[calc(100vh-140px)]">
                
                {/* Título do Board Line */}
                <div className="relative p-5 border-b border-white/5 bg-black/40">
                  <div className={`absolute top-0 left-0 w-full h-1 ${group.colorLine}`}></div>
                  <div className="flex justify-between items-center mt-1">
                    <h3 className={`font-black text-sm uppercase tracking-wider ${group.colorText}`}>{group.label}</h3>
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${group.colorBadge} text-white/90`}>
                      {group.users.length}
                    </span>
                  </div>
                </div>

                {/* Lista de Cards de Usuários */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/10">
                  {group.users.map(user => {
                    const isModified = !!usuariosModificados[user.id];
                    return (
                      <div 
                        key={user.id} 
                        className={`p-4 rounded-xl border transition-all relative overflow-hidden group/card
                          ${isModified ? 'bg-[var(--teal-500)]/5 border-[var(--teal-500)]/40 shadow-[0_0_15px_rgba(11,129,133,0.15)]' : 'bg-[var(--dark-800)] border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                      >
                        {isModified && (
                          <div className="absolute top-0 right-0 p-1 bg-[var(--teal-500)] rounded-bl-lg">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          </div>
                        )}
                        
                        <div className="mb-3">
                          <div className="font-bold text-white text-sm line-clamp-1" title={user.nome_completo || user.username}>{user.nome_completo || user.username}</div>
                          <div className="text-xs text-[var(--teal-300)] mt-0.5 truncate drop-shadow-sm">@{user.username}</div>
                        </div>
                        
                        <select
                          value={usuariosModificados[user.id] || user.nivel_acesso}
                          onChange={(e) => handleMudarNivel(user.id, e.target.value)}
                          className={`w-full text-xs font-medium py-2 px-3 border rounded-lg outline-none transition-colors cursor-pointer appearance-none shadow-inner
                            ${isModified ? 'bg-[var(--teal-500)]/20 border-[var(--teal-500)]/50 text-white' : 'bg-black/30 border-white/10 text-white/80 focus:border-[var(--teal-500)]'}`}
                          style={{
                             backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.4)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                             backgroundRepeat: 'no-repeat',
                             backgroundPosition: 'right 0.75rem center',
                             backgroundSize: '1em'
                          }}
                        >
                          {NIVEIS_ACESSO.map(n => (
                            <option key={n.value} value={n.value} className="bg-[var(--dark-800)] text-white">{n.label}</option>
                          ))}
                        </select>
                      </div>
                    )
                  })}
                  {group.users.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-white/20 py-10 opacity-60">
                       <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                       <span className="text-sm font-medium">Lotaçáo Vazia</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
