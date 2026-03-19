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
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen pb-24 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <button 
               onClick={() => navigate('/dashboard')}
               className="p-2.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 shadow-sm transition-all hover:scale-105 active:scale-95 group"
             >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
             </button>
             <div>
               <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mapa de Calor Analítico</h1>
               <p className="text-gray-500 text-sm mt-0.5 font-medium">Bolhas proporcionais de produtividade nos locais de atendimento.</p>
             </div>
          </div>
          {isLoading && (
            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"></div>
          )}
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
              placeholder="Todos os Filtros..."
            />
          </div>

          <div className="flex flex-col relative z-[50]">
            <span className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
               <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/></svg>
               Tipos de Serviço
            </span>
            <MultiSelect
              options={TIPOS_OPTIONS}
              selectedValues={selectedTipos}
              onChange={setSelectedTipos}
              placeholder="Todos Tipos..."
            />
          </div>

          <div className="flex flex-col relative z-[40]">
            <span className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
               <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
               Atendentes
            </span>
            <MultiSelect
              options={atendentesOptions}
              selectedValues={selectedAtendentes}
              onChange={setSelectedAtendentes}
              placeholder="Todos Operadores..."
            />
          </div>
        </div>

        {/* Quadro do Mapa */}
        <div className="bg-white p-2 sm:p-4 rounded-2xl shadow-sm border border-gray-100 relative w-full flex-1 h-[600px] min-h-[500px] overflow-hidden z-10">
           {stats && stats.mapa_postos ? (
             <MapContainer 
               center={getMapCenter()} 
               zoom={12} 
               className="w-full h-full rounded-xl bg-gray-50 z-0" 
               style={{ minHeight: '100%', height: '100%', width: '100%' }}
               zoomControl={true}
             >
               {/* CartoLight Base Map (White/Light theme) */}
               <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
                         fillColor: '#3b82f6', // blue-500
                         color: '#2563eb', // blue-600
                         weight: 2, 
                         fillOpacity: 0.45 + (peso * 0.35) 
                       }}
                     >
                       <Tooltip direction="top" className="bg-white text-gray-900 border-none shadow-xl rounded-xl custom-leaflet-tooltip p-0 opacity-100">
                         <div className="min-w-[200px] pointer-events-none">
                           <div className="bg-blue-600 text-white px-3 py-2 rounded-t-lg font-black text-sm border-b border-blue-700">
                              {posto.posto__nome_posto}
                           </div>
                           <div className="p-3 bg-white rounded-b-lg border border-gray-100 border-t-0">
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
             <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 space-y-4 bg-gray-50 rounded-xl">
                 <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                 <p className="font-bold animate-pulse">Cruzando geolocalizações no DB...</p>
             </div>
           )}
        </div>
      </div>

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
