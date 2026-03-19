import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import MultiSelect from '../components/MultiSelect';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const TIPOS_OPTIONS = [
  { label: 'Emissão', value: 'EMISSAO' },
  { label: 'Serviço', value: 'SERVICO' },
  { label: 'Informação', value: 'INFORMACAO' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [postosOptions, setPostosOptions] = useState([]);
  const [atendentesOptions, setAtendentesOptions] = useState([]);

  // States de Filtros
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [selectedPostos, setSelectedPostos] = useState([]);
  const [selectedTipos, setSelectedTipos] = useState([]);
  const [selectedAtendentes, setSelectedAtendentes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar opções dos filtros na inicialização
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [resPostos, resUsuarios] = await Promise.all([
          api.get('postos/'),
          api.get('usuarios/')
        ]);
        setPostosOptions(resPostos.data.map(p => ({ label: p.nome_posto, value: String(p.id) })));
        setAtendentesOptions(resUsuarios.data.map(u => ({ label: u.nome_completo || u.username, value: String(u.id) })));
      } catch (err) {
        console.error("Erro ao carregar opções de filtro", err);
      }
    };
    fetchOptions();
  }, []);

  // Buscar dados do Dashboard sempre que um filtro mudar
  useEffect(() => {
    buscarDadosDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataInicio, dataFim, selectedPostos, selectedTipos, selectedAtendentes]);

  const buscarDadosDashboard = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.append('data_inicio', dataInicio);
      if (dataFim) params.append('data_fim', dataFim);
      if (selectedPostos.length > 0) params.append('postos', selectedPostos.join(','));
      if (selectedTipos.length > 0) params.append('tipos', selectedTipos.join(','));
      if (selectedAtendentes.length > 0) params.append('atendentes', selectedAtendentes.join(','));

      const res = await api.get(`dashboard-stats/?${params.toString()}`);
      setStats(res.data);
    } catch (err) {
      console.error("Erro ao buscar dados do dashboard", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRankingTable = (title, data, nameKey, nameLabel) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600 bg-gray-50/50">
              <th className="py-3 px-3 rounded-l-lg font-semibold">{nameLabel}</th>
              <th className="py-3 px-2 font-semibold text-center text-blue-600">Emissão</th>
              <th className="py-3 px-2 font-semibold text-center text-purple-600">Serviço</th>
              <th className="py-3 px-2 font-semibold text-center text-orange-600">Info</th>
              <th className="py-3 px-3 rounded-r-lg font-bold text-center text-indigo-900">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data && data.length > 0 ? data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                <td className="py-3 px-3 font-medium text-gray-800 max-w-[150px] truncate" title={item[nameKey]}>
                  {item[nameKey] || 'N/A'}
                </td>
                <td className="py-3 px-2 text-center text-gray-600 bg-blue-50/20 group-hover:bg-transparent transition">{item.emissao}</td>
                <td className="py-3 px-2 text-center text-gray-600 bg-purple-50/20 group-hover:bg-transparent transition">{item.servico}</td>
                <td className="py-3 px-2 text-center text-gray-600 bg-orange-50/20 group-hover:bg-transparent transition">{item.informacao}</td>
                <td className="py-3 px-3 text-center font-bold text-indigo-900 bg-indigo-50/20 group-hover:bg-transparent transition">{item.total}</td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="py-8 text-center text-gray-500 font-medium bg-gray-50 rounded-xl">Nenhum dado cadastrado para este cenário de filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => navigate('/selecionar')}
               className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 shadow-sm transition-all hover:scale-105 active:scale-95 group"
             >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
             </button>
             <div>
               <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics & Produtividade</h1>
               <p className="text-gray-500 text-sm mt-0.5 font-medium">Extração livre de métricas da corporação e monitoramento comportamental em tempo real.</p>
             </div>
          </div>
          <button 
            type="button"
            onClick={() => window.location.href = '/mapa-calor'}
            className="flex items-center gap-2 bg-gradient-to-r from-[var(--teal-600)] to-[var(--teal-500)] text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-[var(--teal-500)]/30 hover:scale-105 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-[var(--teal-500)]/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mapa de Calor Analítico
          </button>
        </div>

        {/* Toolbar de Filtros */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-y-5 gap-x-4 items-end z-20 relative">
          
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Período De</span>
            <input 
              type="date" 
              className="border border-gray-200 rounded-lg p-2 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 h-[42px] transition outline-none cursor-pointer"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Período Até</span>
            <input 
              type="date" 
              className="border border-gray-200 rounded-lg p-2 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 h-[42px] transition outline-none cursor-pointer"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          <div className="flex flex-col relative z-[60]">
            <span className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
              Filtrar Postos
            </span>
            <MultiSelect 
              options={postosOptions} 
              selectedValues={selectedPostos} 
              onChange={setSelectedPostos} 
              placeholder="Todos os Destinos" 
            />
          </div>

          <div className="flex flex-col relative z-[50]">
            <span className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
               <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg>
               Natureza da Ordem
            </span>
            <MultiSelect 
              options={TIPOS_OPTIONS} 
              selectedValues={selectedTipos} 
              onChange={setSelectedTipos} 
              placeholder="Todas Integradas" 
            />
          </div>

          <div className="flex flex-col relative z-[40]">
            <span className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
               <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
               Filtro Colaborador
            </span>
            <MultiSelect 
              options={atendentesOptions} 
              selectedValues={selectedAtendentes} 
              onChange={setSelectedAtendentes} 
              placeholder="Batalhão Inteiro" 
            />
          </div>

        </div>

        {/* Loading Indicator */}
        {isLoading && !stats && (
           <div className="flex justify-center p-12">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
           </div>
        )}

        {/* Corpo do Dashboard */}
        {!isLoading && stats && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {/* Card Totalizador Principal */}
               <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg shadow-blue-900/10 relative overflow-hidden group">
                 <div className="relative z-10 flex flex-col h-full justify-between">
                   <p className="text-sm font-semibold text-blue-100 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <svg className="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9V17a1 1 0 001 1h14a1 1 0 001-1v-.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/></svg>
                     Métrica Global Resultante
                   </p>
                   <h2 className="text-5xl font-black tabular-nums">{stats.total_periodo}</h2>
                 </div>
                 {/* Effetto Decorativo de Fundo */}
                 <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 bg-white/10 w-48 h-48 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
               </div>

               {/* Cards Secundários por Tipo */}
               {TIPOS_OPTIONS.map(tipoObj => {
                  const valor = stats.geral.find(g => g.tipo_atendimento === tipoObj.value)?.total || 0;
                  const cores = {
                    'EMISSAO': 'from-sky-400 to-blue-500 border-b-4 border-blue-600',
                    'SERVICO': 'from-fuchsia-400 to-purple-500 border-b-4 border-purple-600',
                    'INFORMACAO': 'from-amber-400 to-orange-500 border-b-4 border-orange-600'
                  };
                  return (
                    <div key={tipoObj.value} className={`bg-gradient-to-br ${cores[tipoObj.value] || 'bg-white'} p-6 rounded-2xl shadow border border-white/20 text-white flex flex-col justify-between hover:-translate-y-1 transition duration-300`}>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold uppercase tracking-wide opacity-90">{tipoObj.label}</p>
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                          {tipoObj.value === 'EMISSAO' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/></svg>}
                          {tipoObj.value === 'SERVICO' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                          {tipoObj.value === 'INFORMACAO' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/></svg>}
                        </div>
                      </div>
                      <p className="text-4xl font-extrabold tabular-nums">{valor}</p>
                    </div>
                  );
               })}
            </div>

            {/* Gráficos em Tempo Real */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Gráfico de Linhas: Gargalos por Hora */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{height: "400px"}}>
                 <div className="mb-6 flex justify-between items-center">
                   <div>
                     <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                       <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                       Gargalos e Densidade Horária
                     </h3>
                     <p className="text-sm text-gray-400 mt-0.5">Visão do tráfego interno fracionado pelas 24 horas</p>
                   </div>
                 </div>
                 <div className="flex-1 w-full relative">
                   {stats.por_hora?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.por_hora} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                          <defs>
                            <linearGradient id="colorTotalHora" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="hora" tickFormatter={(t) => `${t}h`} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                            formatter={(value) => [<span className="font-bold text-blue-600">{value} Fichas Lançadas</span>, '']}
                            labelFormatter={(label) => <span className="font-bold text-gray-700">Às {label}:00 Horas</span>}
                            labelStyle={{marginBottom: '4px', display: 'block'}}
                          />
                          <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} dot={{r: 4, fill: '#eff6ff', strokeWidth: 2, stroke: '#3b82f6'}} activeDot={{ r: 8, strokeWidth: 0, fill: '#1d4ed8' }} />
                        </LineChart>
                      </ResponsiveContainer>
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                       Acervo insuficiente para os parâmetros.
                     </div>
                   )}
                 </div>
              </div>

              {/* Gráfico de Barras: Produção por Dia */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{height: "400px"}}>
                 <div className="mb-6 flex justify-between items-center">
                   <div>
                     <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                       <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
                       Amplitude e Produtividade Diária
                     </h3>
                     <p className="text-sm text-gray-400 mt-0.5">Comportamento global segmentado por dias úteis aplicáveis</p>
                   </div>
                 </div>
                 <div className="flex-1 w-full relative">
                   {stats.por_dia?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.por_dia} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="dia" 
                            tickFormatter={(t) => {
                               const d = new Date(t);
                               d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                               return d.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
                            }} 
                            axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} 
                          />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} />
                          <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                            formatter={(value) => [<span className="font-bold text-indigo-600">{value} Acessos Resolvidos</span>, '']}
                            labelFormatter={(label) => {
                              const dt = new Date(new Date(label).getTime() + new Date(label).getTimezoneOffset() * 60000);
                              return <span className="font-bold text-gray-700">Data Base: {dt.toLocaleDateString('pt-BR')}</span>;
                            }}
                            labelStyle={{marginBottom: '4px', display: 'block'}}
                          />
                          <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                       Acervo insuficiente para os parâmetros.
                     </div>
                   )}
                 </div>
              </div>

            </div>

            {/* Matrizes / Rankings Tabela */}
            <div className="flex flex-col lg:flex-row gap-6">
              {renderRankingTable("Top 10 Postos Operantes", stats.ranking_postos, "posto__nome_posto", "Organização Operante")}
              {renderRankingTable("Top 10 Colaboradores de Destaque", stats.ranking_atendentes, "atendente__nome_completo", "Identificação Unificada")}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;