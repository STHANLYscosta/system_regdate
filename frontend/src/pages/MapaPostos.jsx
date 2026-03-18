import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import MultiSelect from '../components/MultiSelect';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TIPOS_OPTIONS = [
  { label: 'Emissão', value: 'EMISSAO' },
  { label: 'Serviço', value: 'SERVICO' },
  { label: 'Informação', value: 'INFORMACAO' }
];

export default function MapaPostos() {
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
        console.error("Erro ao carregar opções geo-filtro", err);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    buscarDadosGps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataInicio, dataFim, selectedPostos, selectedTipos, selectedAtendentes]);

  const buscarDadosGps = async () => {
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
      console.error("Erro ao buscar coordenadas", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getMapCenter = () => {
    if (stats && stats.mapa_postos && stats.mapa_postos.length > 0) {
      let firstLat = parseFloat(stats.mapa_postos[0].posto__latitude);
      let firstLng = parseFloat(stats.mapa_postos[0].posto__longitude);
      if (!isNaN(firstLat) && !isNaN(firstLng) && Math.abs(firstLat) <= 90 && Math.abs(firstLng) <= 180) {
        return [firstLat, firstLng];
      }
    }
    return [-3.119027, -60.021731]; // Centro Padrão (Manaus)
  };

  return (
    <div className="min-h-screen page-bg pb-10 hide-scrollbar flex flex-col">
      <header className="app-header z-20">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95 group"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform text-[var(--teal-300)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="hidden sm:block">
              <svg className="w-8 h-8 text-[var(--teal-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
               <h1 className="text-xl font-bold text-white leading-tight">Mapa de Calor Analítico</h1>
               <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Bolhas proporcionais de produtividade.</p>
            </div>
          </div>
          {isLoading && (
            <div className="w-6 h-6 border-2 border-[var(--teal-500)] border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto w-full px-6 mt-6 flex-1 flex flex-col gap-6 relative">
        {/* Toolbar Dark Igual dos Painéis Geenciais */}
        <div className="bg-[var(--dark-800)] p-4 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-y-4 gap-x-4 items-end z-[40]">
          
          <div className="flex flex-col">
            <span className="label-dark mb-1">Período De</span>
            <input 
              type="date" 
              className="input-dark py-2 outline-none"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <span className="label-dark mb-1">Período Até</span>
            <input 
              type="date" 
              className="input-dark py-2 outline-none"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          <div className="flex flex-col relative z-[60]">
            <span className="label-dark mb-1">Filtrar Postos</span>
            <div className="h-[40px] bg-black/20 rounded-lg">
              <MultiSelect
                options={postosOptions}
                selected={selectedPostos}
                onChange={setSelectedPostos}
                placeholder="Todos Filtros..."
              />
            </div>
          </div>

          <div className="flex flex-col relative z-[50]">
            <span className="label-dark mb-1">Tipos de Serviço</span>
            <div className="h-[40px] bg-black/20 rounded-lg">
              <MultiSelect
                options={TIPOS_OPTIONS}
                selected={selectedTipos}
                onChange={setSelectedTipos}
                placeholder="Todos Tipos..."
              />
            </div>
          </div>

          <div className="flex flex-col relative z-[40]">
            <span className="label-dark mb-1">Atendentes</span>
            <div className="h-[40px] bg-black/20 rounded-lg">
              <MultiSelect
                options={atendentesOptions}
                selected={selectedAtendentes}
                onChange={setSelectedAtendentes}
                placeholder="Todos Operadores..."
              />
            </div>
          </div>
        </div>

        {/* Quadro do Mapa */}
        <div className="relative w-full flex-1 min-h-[500px] glass-dark rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-1 z-10">
           {stats && stats.mapa_postos ? (
             <MapContainer center={getMapCenter()} zoom={12} className="w-full h-full rounded-[1.4rem] bg-[var(--dark-900)]" zoomControl={true}>
               {/* CartoDark Base Map */}
               <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
               />

               {(() => {
                 const mapData = stats.mapa_postos;
                 const maxTotal = mapData.length > 0 ? Math.max(...mapData.map(p => p.total), 1) : 1;

                 return mapData.map((posto, idx) => {
                   let lat = parseFloat(posto.posto__latitude);
                   let lng = parseFloat(posto.posto__longitude);
                   
                   // Validação rigorosa devido ao erro de -600266...
                   if (isNaN(lat) || isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

                   // Raio proporcional dinâmico (mínimo 15, cresce logaritmicamente/linearmente até ~60)
                   const peso = posto.total / maxTotal;
                   const radius = 15 + (peso * 40);

                   return (
                     <CircleMarker 
                       key={idx}
                       center={[lat, lng]} 
                       radius={radius}
                       pathOptions={{ 
                         fillColor: 'var(--teal-500)', 
                         color: 'var(--teal-300)', 
                         weight: 2, 
                         fillOpacity: 0.45 + (peso * 0.35) 
                       }}
                     >
                       <Tooltip direction="top" className="bg-white text-gray-900 border-none shadow-xl rounded-xl custom-leaflet-tooltip p-0 opacity-100">
                         <div className="min-w-[200px] pointer-events-none">
                           <div className="bg-[var(--teal-500)] text-white px-3 py-2 rounded-t-lg font-black text-sm">
                              {posto.posto__nome_posto}
                           </div>
                           <div className="p-3 bg-white rounded-b-lg">
                             <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm font-medium mb-3">
                               <div className="text-gray-500">Emissão:</div>
                               <div className="font-bold text-blue-600 text-right">{posto.emissao}</div>
                               <div className="text-gray-500">Serviço:</div>
                               <div className="font-bold text-purple-600 text-right">{posto.servico}</div>
                               <div className="text-gray-500">Info:</div>
                               <div className="font-bold text-orange-600 text-right">{posto.informacao}</div>
                             </div>
                             <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-gray-900 text-base font-black">
                               <span>Atendimentos O.S</span>
                               <span>{posto.total}</span>
                             </div>
                           </div>
                         </div>
                       </Tooltip>
                     </CircleMarker>
                   );
                 });
               })()}
               
             </MapContainer>
           ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-white/50 space-y-4">
                 <div className="w-10 h-10 border-4 border-[var(--teal-500)] border-t-transparent rounded-full animate-spin"></div>
                 <p className="font-medium animate-pulse">Cruzando geolocalizações no DB...</p>
             </div>
           )}
        </div>
      </main>

      {/* Helper Inject Custom CSS Tooltip */}
      <style dangerouslySetInnerHTML={{__html:`
         .custom-leaflet-tooltip {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
         }
         .custom-leaflet-tooltip::before {
            display: none !important;
         }
      `}} />
    </div>
  );
}
