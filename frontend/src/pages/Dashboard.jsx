import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('api/dashboard-stats/').then(res => setStats(res.data));
  }, []);

  if (!stats) return <p className="p-10">Carregando indicadores...</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Painel de Desempenho</h1>

      {/* LINHA DE DESTAQUE (HOJE) */}
      <div className="bg-blue-600 text-white p-6 rounded-2xl mb-8 shadow-lg">
        <p className="text-lg opacity-80">Atendimentos Realizados Hoje</p>
        <h2 className="text-5xl font-black">{stats.hoje_total}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.geral.map(item => (
          <div key={item.tipo_atendimento} className="bg-white p-6 rounded-xl shadow border-t-4 border-blue-500">
            <p className="text-gray-500 font-bold uppercase text-xs">{item.tipo_atendimento}</p>
            <p className="text-3xl font-bold text-gray-800">{item.total}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4">Ranking por Posto</h3>
        <div className="space-y-4">
          {stats.ranking_postos.map(posto => (
            <div key={posto.posto__nome_posto} className="flex items-center justify-between">
              <span className="text-gray-700">{posto.posto__nome_posto || 'Externo/Outros'}</span>
              <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{width: `${(posto.total / stats.hoje_total || 1) * 100}%`}}></div>
              </div>
              <span className="font-bold">{posto.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;