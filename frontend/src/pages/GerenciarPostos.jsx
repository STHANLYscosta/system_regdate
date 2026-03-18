import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

const GerenciarPostos = () => {
  const [postos, setPostos] = useState([]);
  const [supervisores, setSupervisores] = useState([]);
  
  // Filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Modal e Formulário
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  const [formData, setFormData] = useState({
    nome_posto: '', endereco: '', latitude: '', longitude: '', tipo: 'FIXO', status: 'A', responsavel_id: ''
  });

  const navigate = useNavigate();

  useEffect(() => { 
    carregarPostos();
    carregarSupervisores();
  }, []);

  const carregarPostos = async () => {
    try {
      const res = await api.get('postos/');
      setPostos(res.data);
    } catch (err) {
      console.error("Erro ao carregar postos", err);
    }
  };

  const carregarSupervisores = async () => {
    try {
      const res = await api.get('usuarios/');
      const aptos = res.data.filter(u => u.nivel_acesso === 'GERENTE' || u.nivel_acesso === 'SUPERVISOR');
      setSupervisores(aptos);
    } catch (err) {
      console.error("Erro ao carregar supervisores", err);
    }
  };

  const handleAbrirModal = (posto = null) => {
    if (posto) {
      setEditandoId(posto.id);
      setFormData({
        nome_posto: posto.nome_posto || '',
        endereco: posto.endereco || '',
        latitude: posto.latitude || '',
        longitude: posto.longitude || '',
        tipo: posto.tipo || 'FIXO',
        status: posto.status || 'A',
        responsavel_id: posto.responsavel || ''
      });
    } else {
      setEditandoId(null);
      setFormData({
        nome_posto: '', endereco: '', latitude: '', longitude: '', tipo: 'FIXO', status: 'A', responsavel_id: ''
      });
    }
    setShowModal(true);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!formData.nome_posto.trim()) return;
    
    setIsSubmitting(true);
    const payload = { ...formData };

    if (payload.latitude === '' || payload.latitude === null) {
      payload.latitude = null;
    } else {
      let lat = parseFloat(payload.latitude.toString().replace(',', '.'));
      if (!isNaN(lat)) payload.latitude = lat.toFixed(6);
      else payload.latitude = null;
    }

    if (payload.longitude === '' || payload.longitude === null) {
      payload.longitude = null;
    } else {
      let lngStr = payload.longitude.toString().replace(',', '.');
      let lng = parseFloat(lngStr);
      if (!isNaN(lng) && Math.abs(lng) > 180 && !lngStr.includes('.')) {
         const isNegative = lngStr.startsWith('-');
         const insertPos = (isNegative ? 1 : 0) + 2; 
         lngStr = lngStr.slice(0, insertPos) + '.' + lngStr.slice(insertPos);
         lng = parseFloat(lngStr);
      }
      if (!isNaN(lng)) payload.longitude = lng.toFixed(6);
      else payload.longitude = null;
    }

    if (payload.responsavel_id === '') payload.responsavel_id = null;

    try {
      if (editandoId) {
        await api.put('postos/', { id: editandoId, ...payload });
      } else {
        await api.post('postos/', payload);
      }
      setShowModal(false);
      carregarPostos();
    } catch (err) { 
      let errorMsg = "Verifique a sua conexão com o servidor e permissões.";
      if (err.response?.data) {
        if (err.response.data.erro) {
          errorMsg = err.response.data.erro;
        } else if (typeof err.response.data === 'object') {
          const mensagens = Object.entries(err.response.data)
            .map(([campo, erro]) => `${campo}: ${Array.isArray(erro) ? erro.join(' ') : erro}`)
            .join('\n');
          if (mensagens) errorMsg = mensagens;
        }
      }
      alert(`Erro ao salvar posto:\n${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const postosFiltrados = postos.filter(p => {
    const matchNome = p.nome_posto.toLowerCase().includes(filtroNome.toLowerCase());
    const matchStatus = filtroStatus ? p.status === filtroStatus : true;
    const matchTipo = filtroTipo ? p.tipo === filtroTipo : true;
    return matchNome && matchStatus && matchTipo;
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
              Gerenciamento de Postos
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
        {/* Painel de Controle Topo */}
        <div className="flex flex-col xl:flex-row justify-between items-end gap-3 mb-6">
          <div className="w-full xl:w-auto flex-1 max-w-4xl bg-[var(--dark-800)] p-4 rounded-2xl border border-white/5 flex flex-wrap lg:flex-nowrap gap-3">
            <div className="w-full lg:flex-1">
              <input type="text" className="input-dark w-full" placeholder="Pesquisar posto pelo nome..." value={filtroNome} onChange={e => setFiltroNome(e.target.value)} />
            </div>
            <select className="input-dark flex-1 min-w-[140px] cursor-pointer" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <option value="">Todos Tipos</option>
              {['FIXO', 'ITINERANTE', 'VIRTUAL'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="input-dark flex-1 min-w-[140px] cursor-pointer" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
              <option value="">Qualquer Status</option>
              <option value="A">Ativo</option>
              <option value="I">Inativo</option>
            </select>
          </div>
          
          <button onClick={() => handleAbrirModal()} className="btn-primary flex items-center gap-2 shrink-0 py-3.5 whitespace-nowrap">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Novo Posto
          </button>
        </div>

        {/* Tabela de Postos */}
        <div className="card-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-black/20 border-b border-white/5">
                <tr>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--teal-400)]">Organização</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--teal-400)]">Classificação</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--teal-400)]">Líder Atual</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--teal-400)] text-center">Fichas Ativas</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-[var(--teal-400)] text-center">Config</th >
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {postosFiltrados.length > 0 ? (
                  postosFiltrados.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-white text-base">{p.nome_posto}</div>
                        <div className="text-xs text-[var(--color-text-muted)] truncate max-w-xs mt-0.5">
                          {p.endereco || <span className="italic">Nenhum endereço fornecido</span>}
                        </div>
                      </td>
                      <td className="p-4">
                         <div className="flex flex-col gap-1.5 items-start">
                             <span className="badge-teal text-[10px] uppercase">
                               {p.tipo}
                             </span>
                             <span className="text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full"
                               style={{ 
                                 borderColor: p.status === 'A' ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)',
                                 color: p.status === 'A' ? '#4ade80' : '#f87171',
                                 background: p.status === 'A' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)'
                               }}>
                               {p.status === 'A' ? 'Ativo' : 'Inativo'}
                             </span>
                         </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-sm text-[var(--color-text-secondary)]">
                          {p.nome_responsavel || <span className="opacity-50 italic">Não designado</span>}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--teal-500)] bg-[var(--teal-500)]/20 text-[var(--teal-300)] font-bold text-sm shadow-[0_0_15px_rgba(11,129,133,0.3)]">
                          {p.qtd_pessoas_ativas || 0}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleAbrirModal(p)} className="p-2 rounded-lg bg-white/5 hover:bg-[var(--teal-600)] transition text-[var(--teal-300)] hover:text-white">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                   <tr>
                     <td colSpan="5" className="p-10 text-center text-[var(--color-text-muted)]">Nenhum posto encontrado.</td>
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
          <div className="glass-dark rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border-t border-[var(--teal-500)]">
            
            {/* Fechar SVG topo direito */}
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-[var(--color-text-muted)] hover:text-white transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h2 className="text-2xl font-black mb-6" style={{ color: 'var(--color-text-primary)' }}>
              {editandoId ? 'Editar Posto' : 'Novo Posto'}
            </h2>
            
            <form onSubmit={handleSalvar} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="label-dark">Nome do Posto *</label>
                   <input className="input-dark py-2.5" placeholder="Sede Principal" value={formData.nome_posto} required onChange={e => setFormData({...formData, nome_posto: e.target.value})} />
                 </div>
                 <div>
                   <label className="label-dark">Tipo Estrutural *</label>
                   <select className="input-dark py-2.5 cursor-pointer" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                     <option value="FIXO">Fixo</option>
                     <option value="ITINERANTE">Itinerante</option>
                     <option value="VIRTUAL">Virtual</option>
                   </select>
                 </div>
              </div>
              
              <div>
                <label className="label-dark">Endereço Físico</label>
                <input className="input-dark py-2.5" placeholder="Av Djalma Batista, 1000" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="label-dark">Latitude</label>
                   <input type="number" step="any" className="input-dark py-2.5" placeholder="-3.12169" value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} />
                 </div>
                 <div>
                   <label className="label-dark">Longitude</label>
                   <input type="number" step="any" className="input-dark py-2.5" placeholder="-60.0266" value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-dark">Líder Atual (Gestor)</label>
                    <select className="input-dark py-2.5 cursor-pointer" value={formData.responsavel_id} onChange={e => setFormData({...formData, responsavel_id: e.target.value})}>
                      <option value="">Nenhum</option>
                      {supervisores.map(sup => (
                        <option key={sup.id} value={sup.id}>{sup.nome_completo || sup.username}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-dark">Status Operacional *</label>
                    <select className="input-dark py-2.5 cursor-pointer" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="A">Ativo</option>
                      <option value="I">Suspenso</option>
                    </select>
                  </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-[var(--dark-800)] text-white/70 rounded-xl font-bold hover:bg-black/40 transition">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 btn-primary text-center">
                  {isSubmitting ? 'Salvando...' : 'Salvar Dados'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GerenciarPostos;