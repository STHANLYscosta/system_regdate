import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { criarRegistro } from '../services/registros';

export default function Biometria() {
  const [formData, setFormData] = useState({
    descricao: '',
    cpf: '',
    numero_cartao: '',
    tipo_biometria: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const tiposBiometria = [
    'CADASTRO',
    'ATUALIZAÇÃO',
    'VALIDAÇÃO',
    'CORREÇÃO',
    'OUTRO'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const dados = {
        tipo_atendimento: 'BIOMETRIA',
        descricao: formData.descricao.trim(),
        cpf: formData.cpf.trim(),
        numero_cartao: formData.numero_cartao.trim(),
        tipo_biometria: formData.tipo_biometria
      };

      await criarRegistro(dados);
      
      setSuccess(true);
      setFormData({
        descricao: '',
        cpf: '',
        numero_cartao: '',
        tipo_biometria: ''
      });
      
      // Redireciona após 2 segundos
      setTimeout(() => {
        navigate('/selecionar');
      }, 2000);
      
    } catch (err) {
      console.error('Erro ao registrar:', err);
      setError(err.response?.data?.error || 'Erro ao registrar biometria');
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
              Atendimento de Biometria
            </h1>
            <p className="text-gray-600 mt-1">
              Registrar atendimento biométrico
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
            
            {/* Descrição */}
            <div>
              <label 
                htmlFor="descricao" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Descrição do Atendimento *
              </label>
              <textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Descreva o atendimento realizado..."
                rows="4"
                required
                disabled={loading}
              />
            </div>

            {/* CPF */}
            <div>
              <label 
                htmlFor="cpf" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                CPF do Usuário *
              </label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="000.000.000-00"
                required
                disabled={loading}
                maxLength="14"
              />
            </div>

            {/* Número do Cartão */}
            <div>
              <label 
                htmlFor="numero_cartao" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Número do Cartão *
              </label>
              <input
                id="numero_cartao"
                name="numero_cartao"
                type="text"
                value={formData.numero_cartao}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="Ex: 5804123456789"
                required
                disabled={loading}
                maxLength="20"
              />
            </div>

            {/* Tipo de Biometria */}
            <div>
              <label 
                htmlFor="tipo_biometria" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tipo de Biometria *
              </label>
              <select
                id="tipo_biometria"
                name="tipo_biometria"
                value={formData.tipo_biometria}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white"
                required
                disabled={loading}
              >
                <option value="">Selecione o tipo...</option>
                {tiposBiometria.map(tipo => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Mensagem de Sucesso */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                ✅ Biometria registrada com sucesso! Redirecionando...
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registrando...' : 'Registrar Biometria'}
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
              <li>• Todos os campos são obrigatórios</li>
              <li>• O tipo de cartão é detectado automaticamente pelo número</li>
              <li>• Descreva detalhadamente o atendimento realizado</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}