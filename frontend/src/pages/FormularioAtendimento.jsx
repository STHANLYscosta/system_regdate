import React, { useState } from 'react';
import api from '../services/api'; // Importando a sua configuração do Axios

const FormularioAtendimento = () => {
  // Estado para controlar qual botão foi clicado
  const [tipoAtendimento, setTipoAtendimento] = useState('');

  // Estados para os campos do formulário
  const [formData, setFormData] = useState({
    cpf: '',
    telefone: '',
    email: '',
    // Específicos de Emissão
    nome: '',
    tipo_cartao: '',
    cartao_impresso: false,
    via: '1ª',
    observacao: '',
    // Específico de Serviço
    servico_realizado: '',
    // Específico de Informação
    informacao_passada: ''
  });

  const [mensagem, setMensagem] = useState({ texto: '', erro: false });

  // Lista de cartões para o Select
  const tiposCartao = [
    "VALE TRANSPORTE", "COMUM", "ESCOLAR", "ESC GRATUIDADE", 
    "PCD", "FUNC SISTEMA", "IMMU", "FUNCIONAL", "IDOSO", 
    "SINETRAM", "P SOCIAL"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem({ texto: 'Enviando...', erro: false });

    // Monta o pacote de dados exatamente como o Backend espera
    const payload = {
      tipo_atendimento: tipoAtendimento,
      cpf: formData.cpf,
      telefone: formData.telefone,
      email: formData.email,
    };

    if (tipoAtendimento === 'EMISSAO') {
      payload.nome = formData.nome;
      payload.tipo_cartao = formData.tipo_cartao;
      payload.cartao_impresso = formData.cartao_impresso;
      payload.via = formData.via;
      payload.observacao = formData.observacao;
    } else if (tipoAtendimento === 'SERVICO') {
      payload.servico_realizado = formData.servico_realizado;
    } else if (tipoAtendimento === 'INFORMACAO') {
      payload.informacao_passada = formData.informacao_passada;
    }

    try {
      // Envia para a nossa nova API
      const response = await api.post('registrar/', payload);
      setMensagem({ texto: 'Atendimento registrado com sucesso!', erro: false });
      
      // Limpa os campos após o sucesso (mantendo apenas o tipo selecionado)
      setFormData({
        cpf: '', telefone: '', email: '', nome: '', tipo_cartao: '', 
        cartao_impresso: '', via: '1ª', observacao: '', 
        servico_realizado: '', informacao_passada: ''
      });
      
      // Apaga a mensagem de sucesso após 3 segundos
      setTimeout(() => setMensagem({ texto: '', erro: false }), 3000);

    } catch (error) {
      const erroMsg = error.response?.data?.erro || 'Erro ao registrar atendimento.';
      setMensagem({ texto: erroMsg, erro: true });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      
      {/* Header Voltar */}
      <div className="flex items-center gap-4 mb-6 border-b pb-4">
         <button 
           onClick={() => window.history.back()}
           className="p-2 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 shadow-sm transition-colors group"
         >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
         </button>
         <h2 className="text-2xl font-bold text-gray-800">Registro de Atendimento</h2>
      </div>

      {/* OS 3 BOTÕES DE SELEÇÃO */}
      <div className="flex space-x-4 mb-8">
        {['EMISSAO', 'SERVICO', 'INFORMACAO'].map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => setTipoAtendimento(tipo)}
            className={`flex-1 py-3 px-4 rounded-md font-semibold transition-colors ${
              tipoAtendimento === tipo 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tipo === 'EMISSAO' ? 'Emissão' : tipo === 'SERVICO' ? 'Serviço' : 'Informação'}
          </button>
        ))}
      </div>

      {/* MENSAGEM DE ALERTA */}
      {mensagem.texto && (
        <div className={`p-4 mb-6 rounded-md ${mensagem.erro ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {mensagem.texto}
        </div>
      )}

      {/* FORMULÁRIO */}
      {tipoAtendimento ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* CAMPOS COMUNS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">CPF</label>
              <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required maxLength="11"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input type="text" name="telefone" value={formData.telefone} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
            </div>
          </div>

          {/* CAMPOS ESPECÍFICOS: EMISSÃO */}
          {tipoAtendimento === 'EMISSAO' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                  <input type="text" name="nome" value={formData.nome} onChange={handleChange} required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Cartão</label>
                  <select name="tipo_cartao" value={formData.tipo_cartao} onChange={handleChange} required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
                    <option value="">Selecione...</option>
                    {tiposCartao.map(cartao => (
                      <option key={cartao} value={cartao}>{cartao}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cartão Impresso</label>
                  <input type="text" name="cartao_impresso" value={formData.cartao_impresso} onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Via</label>
                  <select name="via" value={formData.via} onChange={handleChange} required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border">
                    <option value="1ª">1ª Via</option>
                    <option value="2ª">2ª Via</option>
                    <option value="3ª+">3ª Via ou mais</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Observação (Máx 100)</label>
                <textarea name="observacao" value={formData.observacao} onChange={handleChange} maxLength="100" rows="2"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
            </div>
          )}

          {/* CAMPOS ESPECÍFICOS: SERVIÇO */}
          {tipoAtendimento === 'SERVICO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Serviço Realizado (Máx 200)</label>
              <textarea name="servico_realizado" value={formData.servico_realizado} onChange={handleChange} required maxLength="200" rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
          )}

          {/* CAMPOS ESPECÍFICOS: INFORMAÇÃO */}
          {tipoAtendimento === 'INFORMACAO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Informação Passada (Máx 200)</label>
              <textarea name="informacao_passada" value={formData.informacao_passada} onChange={handleChange} required maxLength="200" rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
            </div>
          )}

          {/* BOTÃO SALVAR */}
          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded focus:outline-none focus:shadow-outline">
              Salvar Atendimento
            </button>
          </div>

        </form>
      ) : (
        <div className="text-center text-gray-500 py-10">
          Selecione o tipo de atendimento acima para começar.
        </div>
      )}
    </div>
  );
};

export default FormularioAtendimento;