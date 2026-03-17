import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarRegistro } from '../services/registros';

export default function Servico() {
  const [tipoServico, setTipoServico] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const tiposServico = [
    'TRIAGEM',
    'RECLAMAÇÃO',
    'ELOGIO',
    'SUGESTÃO',
    'PROTOCOLO',
    'ENCAMINHAMENTO',
    'ATENDIMENTO SOCIAL',
    'OUTRO'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const dados = {
        tipo_atendimento: 'SERVICO',
        tipo_servico: tipoServico
      };

      await criarRegistro(dados);
      
      setSuccess(true);
      setTipoServico('');
      
      // Redireciona após 2 segundos
      setTimeout(() => {
        navigate('/selecionar');
      }, 2000);
      
    } catch (err) {
      console.error('Erro ao registrar:', err);
      setError(err.response?.data?.error || 'Erro ao registrar serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Serviço / Triagem
            </h1>
            <p className="text-gray-600 mt-1">
              Registrar serviço ou triagem realizada
            </p>
          </div>
          
          <button
            onClick={() => navigate('/selecionar')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
          >
            ← Voltar
          </button>
        </div>
      </header>

      {/* Formulário */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Tipo de Serviço */}
            <div>
              <label 
                htmlFor="tipoServico" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tipo de Serviço *
              </label>
              <select
                id="tipoServico"
                value={tipoServico}
                onChange={(e) => setTipoServico(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white"
                required
                disabled={loading}
              >
                <option value="">Selecione o tipo de serviço...</option>
                {tiposServico.map(tipo => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Selecione o tipo de serviço ou triagem realizada
              </p>
            </div>

            {/* Mensagem de Sucesso */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                ✅ Serviço registrado com sucesso! Redirecionando...
              </div>
            )}

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                ❌ {error}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading || success}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registrando...' : 'Registrar Serviço'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/selecionar')}
                disabled={loading}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>

          </form>

          {/* Informações */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              ℹ️ Informações:
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Selecione o tipo de serviço prestado</li>
              <li>• Triagem é o encaminhamento do usuário ao setor correto</li>
              <li>• Este registro ajuda no controle de demandas</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}