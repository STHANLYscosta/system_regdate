import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, trocarSenhaPrimeiroAcesso } from '../services/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPrimeiroAcesso, setIsPrimeiroAcesso] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isPrimeiroAcesso) {
        if (password === newPassword) {
            setError('A nova senha não pode ser igual à senha provisória.');
            setLoading(false);
            return;
        }
        await trocarSenhaPrimeiroAcesso(username, password, newPassword);
        // Após trocar, loga normalmente
        await login(username, newPassword);
        navigate('/selecionar');
      } else {
        await login(username, password);
        // Login bem-sucedido, redireciona para seleção
        navigate('/selecionar');
      }
    } catch (err) {
      if (err.message === "PRIMEIRO_ACESSO") {
        setIsPrimeiroAcesso(true);
        setError('Por segurança, você deve alterar sua senha no primeiro acesso.');
      } else {
        console.error('Erro no login/troca de senha:', err);
        setError(err.response?.data?.erro || 'Usuário ou senha incorretos');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* Logo/Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Sistema de Atendimento
          </h1>
          <p className="text-gray-600">
            {isPrimeiroAcesso ? 'Defina sua nova senha de acesso' : 'Faça login para continuar'}
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Usuário */}
          {!isPrimeiroAcesso && (
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
               <input
                 type="text"
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                 placeholder="Digite seu usuário"
                 required
                 disabled={loading}
               />
             </div>
          )}
          {isPrimeiroAcesso && (
              <div className="text-sm text-gray-600 font-medium mb-4">
                 Usuário: <span className="font-bold text-gray-900">{username}</span>
              </div>
          )}

          {/* Campo Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
               {isPrimeiroAcesso ? 'Senha Atual (Provisória)' : 'Senha'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder={isPrimeiroAcesso ? "Digite a senha fornecida" : "Digite sua senha"}
              required
              disabled={loading || isPrimeiroAcesso}
            />
          </div>

          {/* Campo Nova Senha */}
          {isPrimeiroAcesso && (
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Digite sua nova senha"
                  required
                  disabled={loading}
                  autoFocus
                />
             </div>
          )}

          {/* Mensagem de Erro */}
          {error && (
            <div className={`border px-4 py-3 rounded-lg text-sm ${isPrimeiroAcesso && error.includes('segurança') ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {error}
            </div>
          )}

          {/* Botão de Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Processando...' : (isPrimeiroAcesso ? 'Confirmar e Entrar' : 'Entrar')}
          </button>
        </form>

        {/* Rodapé */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Sistema de Registro de Atendimentos v1.0
        </div>
      </div>
    </div>
  );
}