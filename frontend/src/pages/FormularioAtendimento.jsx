import React, { useState } from 'react';
import api from '../services/api';
import { logout } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const TIPOS_CARTAO = [
  "VALE TRANSPORTE", "COMUM", "ESCOLAR", "ESC GRATUIDADE",
  "PCD", "FUNC SISTEMA", "IMMU", "FUNCIONAL", "IDOSO",
  "SINETRAM", "P SOCIAL"
];

const TIPOS_SERVICO = [
  "ATUALIZAÇÃO DE FOTO", "TROCA DE E-MAIL", "VALIDAÇÃO DE RECARGA",
  "VENDA JUSTIFICADA", "REVISÃO DE CRÉDITO", "JUNÇÃO DE CADASTRO",
  "ATUALIZAÇÃO DE DATA DE COMPRA", "AGENDAMENTO EXPRESSO",
  "DESBLOQUEIO DE CARTÃO", "CORREÇÃO DE SALDO", "SOLICITAÇÃO DE BLOQUEIO"
];

const TIPOS = [
  {
    id: 'EMISSAO',
    label: 'Emissão',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
      </svg>
    ),
  },
  {
    id: 'SERVICO',
    label: 'Serviço',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'INFORMACAO',
    label: 'Informação',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
      </svg>
    ),
  },
];

function InputField({ label, children }) {
  return (
    <div>
      <label className="label-dark">{label}</label>
      {children}
    </div>
  );
}

const FormularioAtendimento = () => {
  const navigate = useNavigate();
  const nome = localStorage.getItem('nome') || 'Usuário';
  const [tipoAtendimento, setTipoAtendimento] = useState('');
  const [formData, setFormData] = useState({
    cpf: '', telefone: '', email: '', nome: '', tipo_cartao: '',
    cartao_impresso: '', via: '1ª', observacao: '',
    servico_realizado: '', informacao_passada: ''
  });
  const [mensagem, setMensagem] = useState({ texto: '', erro: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ texto: '', erro: false });
    const payload = { tipo_atendimento: tipoAtendimento, cpf: formData.cpf, telefone: formData.telefone, email: formData.email };
    if (tipoAtendimento === 'EMISSAO') {
      Object.assign(payload, { nome: formData.nome, tipo_cartao: formData.tipo_cartao, cartao_impresso: formData.cartao_impresso, via: formData.via, observacao: formData.observacao });
    } else if (tipoAtendimento === 'SERVICO') {
      payload.servico_realizado = formData.servico_realizado;
    } else if (tipoAtendimento === 'INFORMACAO') {
      payload.informacao_passada = formData.informacao_passada;
    }
    try {
      await api.post('registrar/', payload);
      setMensagem({ texto: '✅ Atendimento registrado com sucesso!', erro: false });
      setFormData({ cpf: '', telefone: '', email: '', nome: '', tipo_cartao: '', cartao_impresso: '', via: '1ª', observacao: '', servico_realizado: '', informacao_passada: '' });
      setTimeout(() => setMensagem({ texto: '', erro: false }), 3500);
    } catch (error) {
      setMensagem({ texto: error.response?.data?.erro || 'Erro ao registrar atendimento.', erro: true });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'input-dark mt-1';
  const selectClass = 'input-dark mt-1 cursor-pointer';

  return (
    <div className="min-h-screen page-bg">
      {/* Header */}
      <header className="app-header">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()}
              className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95 group"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" style={{ color: 'var(--teal-300)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <img src="/src/assets/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" onError={(e) => e.target.style.display = 'none'} />
            <div>
              <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>Registrar Atendimento</h1>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Operador: {nome}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 py-10">

        {/* Seleção de Tipo */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {TIPOS.map(tipo => (
            <button key={tipo.id} type="button" onClick={() => setTipoAtendimento(tipo.id)}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl font-semibold text-sm transition-all duration-200 hover:-translate-y-1 ${tipoAtendimento === tipo.id
                ? 'text-white shadow-lg scale-[1.03]'
                : 'hover:scale-[1.01]'
                }`}
              style={tipoAtendimento === tipo.id
                ? { background: 'linear-gradient(135deg, #0B8185, #1F5F61)', boxShadow: '0 8px 24px rgba(11,129,133,0.45)', border: '1px solid rgba(11,129,133,0.4)' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)' }
              }>
              <span className={tipoAtendimento === tipo.id ? 'text-white' : 'text-[var(--teal-400)]'}>{tipo.icon}</span>
              {tipo.label}
            </button>
          ))}
        </div>

        {/* Mensagem de feedback */}
        {mensagem.texto && (
          <div className={`mb-6 px-5 py-4 rounded-xl text-sm font-medium flex items-center gap-3 ${mensagem.erro ? 'text-red-300' : 'text-[var(--teal-300)]'}`}
            style={{ background: mensagem.erro ? 'rgba(239,68,68,0.10)' : 'rgba(11,129,133,0.12)', border: `1px solid ${mensagem.erro ? 'rgba(239,68,68,0.25)' : 'rgba(11,129,133,0.25)'}` }}>
            {mensagem.texto}
          </div>
        )}

        {/* Formulário */}
        {tipoAtendimento ? (
          <form onSubmit={handleSubmit} className="space-y-6 card-dark p-8">

            {/* Dados Comuns */}
            <div>
              <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--teal-400)' }}>DADOS DO CIDADÃO</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="CPF *">
                  <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required maxLength="11" className={inputClass} placeholder="Apenas números" />
                </InputField>
                <InputField label="Telefone">
                  <input type="text" name="telefone" value={formData.telefone} onChange={handleChange} className={inputClass} placeholder="(92) 99999-0000" />
                </InputField>
                <InputField label="E-mail">
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="exemplo@email.com" />
                </InputField>
              </div>
            </div>

            <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}></div>

            {/* Campos Emissão */}
            {tipoAtendimento === 'EMISSAO' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--teal-400)' }}>DADOS DA EMISSÃO</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Nome Completo *">
                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className={inputClass} />
                  </InputField>
                  <InputField label="Tipo de Cartão *">
                    <select name="tipo_cartao" value={formData.tipo_cartao} onChange={handleChange} required className={selectClass}>
                      <option value="">Selecione...</option>
                      {TIPOS_CARTAO.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </InputField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Cartão Impresso (Nº) *">
                    <input
                      type="text"
                      name="cartao_impresso"
                      value={formData.cartao_impresso || ""}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="58.00.00000000-00 (Cartão completo)"
                      required
                    />
                  </InputField>
                  <InputField label="Via *">
                    <select name="via" value={formData.via} onChange={handleChange} required className={selectClass}>
                      <option value="1ª">1ª Via</option>
                      <option value="2ª">2ª Via</option>
                    </select>
                  </InputField>
                </div>
                <InputField label="Observação (Máx 100 caracteres)">
                  <textarea name="observacao" value={formData.observacao} onChange={handleChange} maxLength="100" rows="2" className={inputClass} />
                </InputField>
              </div>
            )}

            {/* Campos Serviço */}
            {tipoAtendimento === 'SERVICO' && (
              <div>
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--teal-400)' }}>DADOS DO SERVIÇO</h3>
                <InputField label="Serviço Realizado (Máx 200 caracteres) *">
                  <textarea 
                    name="servico_realizado" 
                    value={formData.servico_realizado} 
                    onChange={handleChange} 
                    required 
                    maxLength="200" 
                    rows="3" 
                    className={inputClass} 
                    placeholder="Descreva brevemente o serviço prestado..." 
                  />
                </InputField>
              </div>
            )}

            {/* Campos Informação */}
            {tipoAtendimento === 'INFORMACAO' && (
              <div>
                <InputField label="Detalhes da Informação repassada ao Cidadão *">
                  <textarea name="informacao_passada" value={formData.informacao_passada} onChange={handleChange} required maxLength="200" rows="4" className={inputClass} placeholder="Descreva os assuntos tratados e a orientação final prestada..." />
                </InputField>
              </div>
            )}

            {/* Botão Salvar */}
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={loading}
                className="btn-primary flex items-center gap-2.5 px-8">
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Registrando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Salvar Atendimento
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="card-dark flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-16 h-16 mb-4" style={{ color: 'var(--teal-600)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Selecione o tipo de atendimento acima</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Emissão, Serviço ou Informação</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default FormularioAtendimento;