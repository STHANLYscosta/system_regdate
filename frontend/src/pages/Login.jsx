import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, trocarSenhaPrimeiroAcesso } from '../services/auth';

// ─── Ícones SVG inline ───────────────────────────────────────
const IconUser = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const IconLock = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IconKey = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);
const IconArrow = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
const IconShield = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

// ─── Campo de Input ───────────────────────────────────────────
function InputField({ icon, label, value, onChange, type = 'text', placeholder, required, disabled, autoFocus }) {
  return (
    <div className="space-y-2">
      <label className="label-dark">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--teal-400)] pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="input-dark pl-14"
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
        />
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────
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
        await login(username, newPassword);
        navigate('/selecionar');
      } else {
        await login(username, password);
        navigate('/selecionar');
      }
    } catch (err) {
      if (err.message === "PRIMEIRO_ACESSO") {
        setIsPrimeiroAcesso(true);
        setError('Por segurança, defina uma nova senha para ativar seu acesso.');
      } else {
        setError(err.response?.data?.erro || 'Usuário ou senha incorretos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4 relative overflow-hidden">

      {/* Efeitos de fundo decorativos */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(11,129,133,0.18) 0%, transparent 70%)' }}>
        </div>
        <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(31,95,97,0.14) 0%, transparent 70%)' }}>
        </div>
        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(var(--teal-300) 1px, transparent 1px), linear-gradient(90deg, var(--teal-300) 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
        </div>
      </div>

      {/* Card de Login */}
      <div className="glass-dark rounded-3xl w-full max-w-md animate-fade-up overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]">

        {/* Header do card */}
        <div className="relative px-8 pt-10 pb-8 text-center border-b border-[rgba(11,129,133,0.2)]"
          style={{ background: 'linear-gradient(160deg, rgba(11,129,133,0.12) 0%, transparent 100%)' }}>

          {/* Logo/Ícone animado */}
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="absolute w-24 h-24 rounded-full anim-pulse-teal"
              style={{ background: 'rgba(11,129,133,0.2)' }}>
            </div>
            {/* Disponibilizando Imagem para o usuário trocar depois */}
            <img
              src="/src/assets/images/logo.png"
              alt="Logo do Sistema"
              className="relative z-10 w-20 h-20 object-contain drop-shadow-[0_8px_24px_rgba(11,129,133,0.5)]"
              onError={(e) => {
                // Fallback icon se img nã existir
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            {/* SVG interno de Fallback em caso da imagem ainda nao ter sido injetada ou faltar url */}
            <div className="hidden relative z-10 w-20 h-20 rounded-2xl items-center justify-center flex"
              style={{ background: 'linear-gradient(135deg, #0B8185, #1F5F61)', boxShadow: '0 8px 24px rgba(11,129,133,0.5)' }}>
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Sistema de Atendimento
          </h1>
          <p className="text-sm mt-1.5 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {isPrimeiroAcesso
              ? '🔑 Primeiro Acesso — Defina sua nova senha'
              : 'Acesso Corporativo Seguro'}
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">

          {/* Exibir usuário no modo primeiro acesso */}
          {isPrimeiroAcesso && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(11,129,133,0.12)', border: '1px solid rgba(11,129,133,0.25)' }}>
              <span className="text-[var(--teal-400)]"><IconUser /></span>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Usuário: <strong style={{ color: 'var(--color-text-primary)' }}>{username}</strong>
              </span>
            </div>
          )}

          {/* Campo Usuário */}
          {!isPrimeiroAcesso && (
            <InputField
              icon={<IconUser />}
              label="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="      Digite seu login de acesso"
              required
              disabled={loading}
            />
          )}

          {/* Campo Senha */}
          <InputField
            icon={<IconLock />}
            label={isPrimeiroAcesso ? 'Senha Provisória (CPF)' : 'Senha'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isPrimeiroAcesso ? 'Digite a senha fornecida' : '      Digite sua senha'}
            required
            disabled={loading || isPrimeiroAcesso}
          />

          {/* Campo Nova Senha */}
          {isPrimeiroAcesso && (
            <InputField
              icon={<IconKey />}
              label="Nova Senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Crie uma senha segura"
              required
              disabled={loading}
              autoFocus
            />
          )}

          {/* Mensagem de Erro / Aviso */}
          {error && (
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-medium ${isPrimeiroAcesso && error.includes('segurança')
              ? 'text-[#7BCDD0]'
              : 'text-red-300'
              }`}
              style={{
                background: isPrimeiroAcesso && error.includes('segurança')
                  ? 'rgba(11,129,133,0.12)'
                  : 'rgba(239,68,68,0.10)',
                border: `1px solid ${isPrimeiroAcesso && error.includes('segurança') ? 'rgba(11,129,133,0.25)' : 'rgba(239,68,68,0.25)'}`
              }}>
              <span className="shrink-0 mt-0.5">
                {isPrimeiroAcesso && error.includes('segurança') ? <IconShield /> : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                  </svg>
                )}
              </span>
              <span>{error}</span>
            </div>
          )}

          {/* Botão de Ação */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-3 text-base mt-2"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verificando...
              </>
            ) : (
              <>
                {isPrimeiroAcesso ? 'Confirmar e Ativar Acesso' : 'Entrar no Sistema'}
                <IconArrow />
              </>
            )}
          </button>
        </form>

        {/* Rodapé */}
        <div className="px-8 pb-7 text-center">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Sistema de Registro de Atendimentos · v2.0
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2" style={{ color: 'var(--color-text-muted)' }}>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Acesso criptografado</span>
          </div>
        </div>
      </div>
    </div>
  );
}