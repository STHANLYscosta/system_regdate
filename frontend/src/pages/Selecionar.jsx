import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';
import api from '../services/api';

const OPCOES = [
  {
    titulo: 'Atendimento',
    descricao: 'Registrar Emissão, Serviço ou Informação',
    rota: '/atendimento',
    permissoes: ['ATENDENTE', 'ATENDENTE_II', 'SUPERVISOR', 'GERENTE'],
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    gradient: 'from-[#0B8185] to-[#1F5F61]',
    glow: 'rgba(11,129,133,0.5)',
  },
  {
    titulo: 'Perfil',
    descricao: 'Meus dados e preferências',
    rota: '/perfil',
    permissoes: ['ATENDENTE', 'ATENDENTE_II', 'SUPERVISOR', 'GERENTE'],
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    gradient: 'from-[#36544F] to-[#2a413d]',
    glow: 'rgba(54,84,79,0.5)',
  },
  {
    titulo: 'Dashboard',
    descricao: 'Indicadores, gráficos e desempenho',
    rota: '/dashboard',
    permissoes: ['ATENDENTE_II', 'SUPERVISOR', 'GERENTE'],
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    gradient: 'from-[#403831] to-[#30261C]',
    glow: 'rgba(64,56,49,0.6)',
  },
  {
    titulo: 'Gerenciar Postos',
    descricao: 'Cadastro e visualização de postos',
    rota: '/postos',
    permissoes: ['SUPERVISOR', 'GERENTE'],
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    gradient: 'from-[#1F5F61] to-[#0B8185]',
    glow: 'rgba(31,95,97,0.5)',
  },
  {
    titulo: 'Gerenciar Usuários',
    descricao: 'Equipe, bloqueios e transferências',
    rota: '/usuarios',
    permissoes: ['SUPERVISOR', 'GERENTE'],
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    gradient: 'from-[#36544F] to-[#1F5F61]',
    glow: 'rgba(54,84,79,0.5)',
  },
  {
    titulo: 'Permissões',
    descricao: 'Configurações avançadas de acesso',
    rota: '/permissoes',
    permissoes: ['GERENTE'],
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: 'from-[#403831] to-[#36544F]',
    glow: 'rgba(64,56,49,0.6)',
  },
];

const NIVEL_LABELS = {
  GERENTE: 'Gerente',
  SUPERVISOR: 'Supervisor',
  ATENDENTE_II: 'Atendente II',
  ATENDENTE: 'Atendente',
};

export default function Selecionar() {
  const navigate = useNavigate();
  const nivel = localStorage.getItem('nivel_acesso');
  const [nome, setNome] = useState(localStorage.getItem('nome') || 'Usuário');
  const [posto, setPosto] = useState(localStorage.getItem('posto_atual') || '');

  useEffect(() => {
    // Sincroniza em tempo real caso o gerente tenha transferido de posto por trás
    api.get('perfil/')
      .then(res => {
         if (res.data.posto_atual) {
            setPosto(res.data.posto_atual);
            localStorage.setItem('posto_atual', res.data.posto_atual);
         }
         if (res.data.nome_completo || res.data.username) {
            setNome(res.data.nome_completo || res.data.username);
            localStorage.setItem('nome', res.data.nome_completo || res.data.username);
         }
      })
      .catch(err => console.error("Sincronia ignorada", err));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const opcoesFiltradas = OPCOES.filter(o => o.permissoes.includes(nivel));
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="min-h-screen page-bg">
      {/* Header */}
      <header className="app-header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/src/assets/images/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md" onError={(e) => e.target.style.display='none'} />
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Sistema de Atendimento
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0B8185, #36544F)' }}>
                {nome[0]?.toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{nome}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{NIVEL_LABELS[nivel] || nivel}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10 animate-fade-up">
          <h2 className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>
            {saudacao}, {nome.split(' ')[0]}! 👋
          </h2>
          <p className="mt-2 text-base font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Seu posto atual é <strong style={{color: 'var(--teal-300)'}}>{posto || 'Não definido'}</strong>!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-up">
          {opcoesFiltradas.map((opcao, index) => (
            <button
              key={index}
              onClick={() => navigate(opcao.rota)}
              className={`group relative overflow-hidden rounded-2xl text-left p-6 transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br ${opcao.gradient}`}
              style={{ boxShadow: `0 8px 32px ${opcao.glow}` }}
            >
              {/* Efeito hover */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300" />
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-500" />

              <div className="relative z-10">
                <div className="mb-4 p-3 inline-flex rounded-xl bg-white/15 text-white">
                  {opcao.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">{opcao.titulo}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{opcao.descricao}</p>

                <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-white/60 group-hover:text-white/90 transition-colors">
                  Acessar
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}