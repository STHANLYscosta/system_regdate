import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

export default function Selecionar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const opcoes = [
    {
      titulo: 'Emissão',
      descricao: 'Registrar nova emissão de cartão',
      rota: '/emissao',
      cor: 'from-blue-500 to-blue-600',
      icone: '🎫'
    },
    {
      titulo: 'Biometria',
      descricao: 'Registrar atendimento de biometria',
      rota: '/biometria',
      cor: 'from-green-500 to-green-600',
      icone: '👆'
    },
    {
      titulo: 'Informação',
      descricao: 'Prestar informações ao usuário',
      rota: '/informacao',
      cor: 'from-yellow-500 to-yellow-600',
      icone: 'ℹ️'
    },
    {
      titulo: 'Serviço (Triagem)',
      descricao: 'Registrar serviço ou triagem',
      rota: '/servico',
      cor: 'from-purple-500 to-purple-600',
      icone: '📋'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema de Atendimento
            </h1>
            <p className="text-gray-600 mt-1">
              Selecione o tipo de atendimento
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/registros')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
            >
              Ver Registros
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Grid de Opções */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opcoes.map((opcao, index) => (
            <button
              key={index}
              onClick={() => navigate(opcao.rota)}
              className={`relative overflow-hidden bg-linear-to-br ${opcao.cor} text-white rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition duration-300 p-8 text-left group`}
            >
              {/* Ícone no canto superior direito */}
              <div className="absolute top-4 right-4 text-6xl opacity-20 group-hover:opacity-30 transition">
                {opcao.icone}
              </div>

              {/* Conteúdo */}
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">
                  {opcao.titulo}
                </h2>
                <p className="text-white/90 text-lg">
                  {opcao.descricao}
                </p>
              </div>

              {/* Efeito de hover */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition" />
            </button>
          ))}
        </div>

        {/* Info adicional */}
        <div className="mt-12 text-center text-gray-500">
          <p>Clique em uma opção acima para iniciar o atendimento</p>
        </div>
      </main>
    </div>
  );
}