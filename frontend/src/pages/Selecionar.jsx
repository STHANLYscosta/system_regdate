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
    },
    {
      titulo: 'Biometria',
      descricao: 'Registrar atendimento de biometria facial',
      rota: '/biometria',
      cor: 'from-green-500 to-green-600',
    },
    {
      titulo: 'Informação',
      descricao: 'Registrar atendimento de informação',
      rota: '/informacao',
      cor: 'from-yellow-500 to-yellow-600',
    },
    {
      titulo: 'Serviço / Triagem',
      descricao: 'Registrar atendimento de serviço (triagem)',
      rota: '/servico',
      cor: 'from-purple-500 to-purple-600',
    },
    {
      titulo: 'Registros',
      descricao: 'Visualizar lista de atendimentos realizados',
      rota: '/registros',
      cor: 'from-slate-500 to-slate-600',
    },
    {
      titulo: 'Dashboard',
      descricao: 'Ver indicadores e desempenho por posto/atendente',
      rota: '/dashboard',
      cor: 'from-rose-500 to-rose-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sistema de Registro de Atendimentos
            </h1>
            <p className="text-sm text-gray-500">
              Selecione o tipo de atendimento ou acesse o dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition text-sm"
          >
            Sair
          </button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800">
            O que você deseja fazer?
          </h2>
          <p className="text-gray-500 mt-1">
            Escolha um tipo de atendimento ou abra o painel de análise (Dashboard)
          </p>
        </div>

        {/* GRID DE OPÇÕES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opcoes.map((opcao, index) => (
            <button
              key={index}
              onClick={() => navigate(opcao.rota)}
              className={`
                group relative overflow-hidden rounded-2xl 
                bg-linear-to-br ${opcao.cor}
                text-left text-white p-6 shadow-lg 
                hover:shadow-xl transition transform hover:-translate-y-1
              `}
            >
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">{opcao.titulo}</h3>
                <p className="text-sm text-white/90">{opcao.descricao}</p>
              </div>

              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition" />
            </button>
          ))}
        </div>

        {/* Info adicional */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Clique em uma opção acima para iniciar o atendimento ou acompanhar os indicadores.</p>
        </div>
      </main>
    </div>
  );
}