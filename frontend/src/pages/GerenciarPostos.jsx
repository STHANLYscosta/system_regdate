import React, { useState, useEffect } from 'react';
import api from '../services/api';

const GerenciarPostos = () => {
  const [postos, setPostos] = useState([]);
  const [nomePosto, setNomePosto] = useState('');

  useEffect(() => { carregarPostos(); }, []);

  const carregarPostos = async () => {
    const res = await api.get('postos/');
    setPostos(res.data);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      // Usaremos o admin ou uma rota simples. Por agora, vamos garantir que você tenha dados.
      // Se não criou a view de POST postos, você pode fazer isso rápido no Django Admin, 
      // mas vamos tentar por aqui:
      await api.post('postos/', { nome_posto: nomePosto, status: 'A' });
      setNomePosto('');
      carregarPostos();
    } catch (err) { alert("Erro ao salvar posto."); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Postos de Trabalho</h1>
      <form onSubmit={handleSalvar} className="flex gap-2 mb-8">
        <input 
          className="flex-1 p-2 border rounded" 
          placeholder="Nome do Posto (Ex: Unidade Centro)" 
          value={nomePosto}
          onChange={e => setNomePosto(e.target.value)}
          required
        />
        <button className="bg-green-600 text-white px-6 py-2 rounded font-bold">Cadastrar Posto</button>
      </form>

      <div className="bg-white shadow rounded-lg p-4">
        {postos.map(p => (
          <div key={p.id} className="p-3 border-b last:border-0 flex justify-between">
            <span className="font-medium">{p.nome_posto}</span>
            <span className="text-green-600 text-sm font-bold">Ativo</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GerenciarPostos;