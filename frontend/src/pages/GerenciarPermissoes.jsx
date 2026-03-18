import React, { useState, useEffect } from 'react';
import api from '../services/api';

const NIVEIS_ACESSO = [
  { value: 'GERENTE', label: 'Gerente', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'SUPERVISOR', label: 'Supervisor', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'ATENDENTE_II', label: 'Atendente II', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'ATENDENTE', label: 'Atendente', color: 'bg-green-100 text-green-800 border-green-200' },
];

export default function GerenciarPermissoes() {
  const [usuariosDb, setUsuariosDb] = useState([]);
  const [usuariosModificados, setUsuariosModificados] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const currentUserNivel = localStorage.getItem('nivel_acesso');

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

    // Se voltar pro original, remove da lista de modificados pra não enviar à toa
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
      alert("Permissões atualizadas com sucesso!");
      carregarUsuarios(); // Recarrega para limpar as modificações e atualizar a tela
    } catch (err) {
      const errorMsg = err.response?.data?.erro || "Falha ao salvar.";
      alert(`Erro ao salvar permissões: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (currentUserNivel !== 'GERENTE') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow border border-red-100 text-center max-w-md w-full">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Apenas gerentes podem acessar a tela de gerenciamento de permissões.</p>
        </div>
      </div>
    );
  }

  // Agrupar usuários visualmente pela permissão *atual* (combinando DB e as mudanças pendentes)
  const groupedUsers = NIVEIS_ACESSO.map(nivel => ({
    ...nivel,
    users: usuariosDb.filter(u => {
      const currentLevel = usuariosModificados[u.id] || u.nivel_acesso;
      return currentLevel === nivel.value;
    })
  }));

  const hasChanges = Object.keys(usuariosModificados).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col h-[calc(100vh-4rem)]">
        
        {/* Header Fixo */}
        <div className="p-6 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button 
                onClick={() => window.history.back()}
                className="p-2 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 shadow-sm transition-colors group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">Painel de Controle de Acessos</h1>
            </div>
            <p className="text-gray-500 text-sm pl-12">Gerencie os níveis de permissão dos colaboradores do sistema.</p>
          </div>
          <div className="flex gap-3">
             <button 
                disabled={isSaving || isLoading}
                onClick={carregarUsuarios}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
             >
                Recarregar
             </button>
             <button
               onClick={handleSalvarAlteracoes}
               disabled={!hasChanges || isSaving}
               className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                  hasChanges 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
               }`}
             >
               {isSaving ? (
                 <>
                   <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Salvando...
                 </>
               ) : (
                 <>
                   Salvar Alterações
                   {hasChanges && <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{Object.keys(usuariosModificados).length}</span>}
                 </>
               )}
             </button>
          </div>
        </div>

        {/* Board Horizontal Rolável */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-gray-50/50">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="flex gap-6 h-full min-w-max pb-4">
              {groupedUsers.map(group => (
                <div key={group.value} className="w-80 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm h-full">
                  
                  {/* Título do Grupo */}
                  <div className={`p-4 border-b border-gray-100 flex justify-between items-center rounded-t-xl ${group.color.split(' ')[0]}`}>
                    <h3 className={`font-bold ${group.color.split(' ')[1]}`}>{group.label}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/60 ${group.color.split(' ')[1]}`}>
                      {group.users.length}
                    </span>
                  </div>

                  {/* Lista de Cards */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                    {group.users.map(user => {
                      const isModified = !!usuariosModificados[user.id];
                      return (
                        <div 
                          key={user.id} 
                          className={`p-4 rounded-lg border bg-white transition-all shadow-sm flex flex-col gap-3
                            ${isModified ? 'border-orange-400 ring-1 ring-orange-400/20' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div>
                            <div className="font-semibold text-gray-800 text-sm">{user.nome_completo || user.username}</div>
                            <div className="text-xs text-gray-500 mt-0.5">CPF: {user.cpf}</div>
                          </div>
                          
                          <select
                            value={usuariosModificados[user.id] || user.nivel_acesso}
                            onChange={(e) => handleMudarNivel(user.id, e.target.value)}
                            className={`w-full text-sm py-1.5 px-2 border rounded-md outline-none transition-colors
                              ${isModified ? 'bg-orange-50 border-orange-300 text-orange-800 font-medium' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                          >
                            {NIVEIS_ACESSO.map(n => (
                              <option key={n.value} value={n.value}>{n.label}</option>
                            ))}
                          </select>
                        </div>
                      )
                    })}
                    {group.users.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                         <span className="text-sm">Vazio</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
