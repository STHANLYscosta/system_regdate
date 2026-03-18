import React, { useState, useEffect } from 'react';
import api from '../services/api';

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
    nome_posto: '',
    endereco: '',
    latitude: '',
    longitude: '',
    tipo: 'FIXO',
    status: 'A',
    responsavel_id: ''
  });

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
      // Filtra apenas Gerentes e Supervisores para serem responsáveis
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

    // Formata Latitude (max 9 digitos, 6 decimais pelo model)
    if (payload.latitude === '' || payload.latitude === null) {
      payload.latitude = null;
    } else {
      let lat = parseFloat(payload.latitude.toString().replace(',', '.'));
      if (!isNaN(lat)) payload.latitude = lat.toFixed(6);
      else payload.latitude = null;
    }

    // Formata Longitude (max 9 digitos, 6 decimais)
    if (payload.longitude === '' || payload.longitude === null) {
      payload.longitude = null;
    } else {
      let lngStr = payload.longitude.toString().replace(',', '.');
      let lng = parseFloat(lngStr);
      // Corrige caso comum de colar coordenadas sem o ponto decimal (ex: -600266... -> -60.0266...)
      if (!isNaN(lng) && Math.abs(lng) > 180 && !lngStr.includes('.')) {
         const isNegative = lngStr.startsWith('-');
         const insertPos = (isNegative ? 1 : 0) + 2; // 2 digitos para a parte inteira (ex: -60) no BR
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
    <div className="p-6 max-w-5xl mx-auto">
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
           <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Postos de Trabalho</h1>
        </div>
        <button 
          onClick={() => handleAbrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Novo Posto
        </button>
      </div>

      {/* Seção de Lista e Filtro */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col items-start gap-4">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Lista de Postos</h2>
            <span className="bg-blue-100 text-blue-700 py-0.5 px-2.5 rounded-full text-sm font-medium">
              {postosFiltrados.length}
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
                placeholder="Pesquisar posto por nome..."
                value={filtroNome}
                onChange={e => setFiltroNome(e.target.value)}
              />
            </div>
            
            <select 
              className="p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos os Tipos</option>
              <option value="FIXO">Fixo</option>
              <option value="ITINERANTE">Itinerante</option>
              <option value="VIRTUAL">Virtual</option>
            </select>
            
            <select 
              className="p-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos os Status</option>
              <option value="A">Ativo</option>
              <option value="I">Inativo</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Posto</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Tipo & Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Responsável</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-center">Colaboradores</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {postosFiltrados.length > 0 ? (
                postosFiltrados.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{p.nome_posto}</div>
                      <div className="text-xs text-gray-500 font-medium truncate max-w-xs" title={p.endereco || 'Sem endereço cadastrado'}>
                        {p.endereco || <span className="italic opacity-60">Sem endereço</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${p.tipo === 'VIRTUAL' ? 'bg-purple-100 text-purple-700' : p.tipo === 'ITINERANTE' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                          {p.tipo}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${p.status === 'A' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {p.status === 'A' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {p.nome_responsavel || <span className="text-gray-400 italic">Não vinculado</span>}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                        {p.qtd_pessoas_ativas || 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleAbrirModal(p)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                        title="Editar Posto"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="5" className="p-12 text-center text-gray-500">
                     Nenhum posto encontrado com os filtros atuais.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {postosFiltrados.length === 0 && (
             <div className="p-12 text-center flex flex-col items-center">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-medium text-lg mb-1">Nenhum posto encontrado</h3>
                <p className="text-gray-500 text-sm">
                  {filtroNome ? `Sua busca por "${filtroNome}" não encontrou resultados.` : 'Ainda não há postos cadastrados no sistema.'}
                </p>
             </div>
          )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editandoId ? 'Editar Posto' : 'Cadastrar Novo Posto'}</h2>
            <form onSubmit={handleSalvar} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Posto *</label>
                   <input 
                     className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" 
                     placeholder="Nome" value={formData.nome_posto} required
                     onChange={e => setFormData({...formData, nome_posto: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                   <select 
                     className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                     value={formData.tipo}
                     onChange={e => setFormData({...formData, tipo: e.target.value})}
                   >
                     <option value="FIXO">Fixo</option>
                     <option value="ITINERANTE">Itinerante</option>
                     <option value="VIRTUAL">Virtual</option>
                   </select>
                 </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                <input 
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" 
                  placeholder="Rua, Prédio, Número..." value={formData.endereco}
                  onChange={e => setFormData({...formData, endereco: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                   <input 
                     type="number" step="any"
                     className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" 
                     placeholder="-15.793889" value={formData.latitude}
                     onChange={e => setFormData({...formData, latitude: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                   <input 
                     type="number" step="any"
                     className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" 
                     placeholder="-47.882778" value={formData.longitude}
                     onChange={e => setFormData({...formData, longitude: e.target.value})}
                   />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      value={formData.responsavel_id}
                      onChange={e => setFormData({...formData, responsavel_id: e.target.value})}
                    >
                      <option value="">Nenhum</option>
                      {supervisores.map(sup => (
                        <option key={sup.id} value={sup.id}>{sup.nome_completo || sup.username}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="A">Ativo</option>
                      <option value="I">Inativo</option>
                    </select>
                  </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
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