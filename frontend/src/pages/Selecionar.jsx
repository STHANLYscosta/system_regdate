import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

export default function Selecionar() {
  const navigate = useNavigate();
  const nivel = localStorage.getItem('nivel_acesso'); 

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const todasOpcoes = [
    {
      titulo: 'Atendimento',
      descricao: 'Registrar Emissão, Serviço ou Informação',
      rota: '/atendimento',
      cor: 'from-blue-500 to-blue-600',
      permissoes: ['ATENDENTE', 'ATENDENTE_II', 'SUPERVISOR', 'GERENTE']
    },
    {
      titulo: 'Perfil',
      descricao: 'Meus dados e alterar senha',
      rota: '/perfil',
      cor: 'from-slate-500 to-slate-600',
      permissoes: ['ATENDENTE', 'ATENDENTE_II', 'SUPERVISOR', 'GERENTE']
    },
    {
      titulo: 'Dashboard',
      descricao: 'Indicadores e desempenho',
      rota: '/dashboard',
      cor: 'from-rose-500 to-rose-600',
      permissoes: ['ATENDENTE_II', 'SUPERVISOR', 'GERENTE']
    },
    {
      titulo: 'Gerenciar Postos',
      descricao: 'Cadastro e visualização de postos',
      rota: '/postos',
      cor: 'from-green-500 to-green-600',
      permissoes: ['SUPERVISOR', 'GERENTE']
    },
    {
      titulo: 'Gerenciar Usuários',
      descricao: 'Cadastro, bloqueio e transferências',
      rota: '/usuarios',
      cor: 'from-purple-500 to-purple-600',
      permissoes: ['SUPERVISOR', 'GERENTE']
    },
    {
      titulo: 'Permissões',
      descricao: 'Configurações avançadas do sistema',
      rota: '/permissoes',
      cor: 'from-orange-500 to-orange-600',
      permissoes: ['GERENTE']
    },
  ];

  const opcoesFiltradas = todasOpcoes.filter(opcao => opcao.permissoes.includes(nivel));

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Atendimento</h1>
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm">Sair</button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">O que deseja fazer hoje?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opcoesFiltradas.map((opcao, index) => (
            <button
              key={index}
              onClick={() => navigate(opcao.rota)}
              // Alterado de bg-gradient-to-br para bg-linear-to-br conforme sugerido
              className={`group relative overflow-hidden rounded-2xl bg-linear-to-br ${opcao.cor} text-left text-white p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1`}
            >
              <h3 className="text-lg font-bold mb-2">{opcao.titulo}</h3>
              <p className="text-sm text-white/90">{opcao.descricao}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}