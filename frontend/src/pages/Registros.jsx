import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarRegistros } from '../services/registros';

export default function Registros() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroDataIni, setFiltroDataIni] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroCartao, setFiltroCartao] = useState("");
  const [filtroCpf, setFiltroCpf] = useState("");
  const [filtroAtendente, setFiltroAtendente] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    carregarRegistros(paginaAtual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaAtual]);

  const montarFiltros = () => {
    const filtros = {};
    if (filtroTipo) filtros.tipo = filtroTipo;
    if (filtroDataIni) filtros.data_ini = filtroDataIni;
    if (filtroDataFim) filtros.data_fim = filtroDataFim;
    if (filtroCartao) filtros.cartao = filtroCartao;
    if (filtroCpf) filtros.cpf = filtroCpf;
    if (filtroAtendente) filtros.atendente = filtroAtendente;
    return filtros;
  };

  const carregarRegistros = async (pagina) => {
    setLoading(true);
    setError('');
    try {
      const filtros = montarFiltros();
      const data = await listarRegistros(pagina, filtros);

      setRegistros(data.results || []);
      if (data.total_pages) {
        setTotalPaginas(data.total_pages);
      } else if (data.count) {
        setTotalPaginas(Math.ceil(data.count / 10));
      } else {
        setTotalPaginas(1);
      }
    } catch (err) {
      console.error('Erro ao carregar registros:', err);
      setError('Erro ao carregar registros');
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    // volta para página 1 com filtros aplicados
    setPaginaAtual(1);
    carregarRegistros(1);
  };

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR');
  };

  const getBadgeColor = (tipo) => {
    const cores = {
      'EMISSAO': 'bg-blue-100 text-blue-800',
      'BIOMETRIA': 'bg-green-100 text-green-800',
      'INFORMACAO': 'bg-yellow-100 text-yellow-800',
      'SERVICO': 'bg-purple-100 text-purple-800',
    };
    return cores[tipo] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Registros de Atendimento
            </h1>
            <p className="text-gray-600 mt-1">
              Listagem de todos os atendimentos realizados
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

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-gray-600 mt-4">Carregando registros...</p>
          </div>
        )}

        {/* Erro */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* FILTROS */}
        {!loading && !error && (
          <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Nº cartão"
              className="border p-2 rounded"
              value={filtroCartao}
              onChange={(e) => setFiltroCartao(e.target.value)}
            />

            <input
              type="text"
              placeholder="CPF"
              className="border p-2 rounded"
              value={filtroCpf}
              onChange={(e) => setFiltroCpf(e.target.value)}
            />

            <input
              type="text"
              placeholder="Atendente (login)"
              className="border p-2 rounded"
              value={filtroAtendente}
              onChange={(e) => setFiltroAtendente(e.target.value)}
            />

            <select
              className="border p-2 rounded"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos os tipos</option>
              <option value="EMISSAO">Emissão</option>
              <option value="BIOMETRIA">Biometria</option>
              <option value="INFORMACAO">Informação</option>
              <option value="SERVICO">Serviço</option>
            </select>

            <input
              type="date"
              className="border p-2 rounded"
              value={filtroDataIni}
              onChange={(e) => setFiltroDataIni(e.target.value)}
            />

            <input
              type="date"
              className="border p-2 rounded"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
            />

            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={aplicarFiltros}
            >
              Filtrar
            </button>
          </div>
        )}

        {/* Tabela */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {registros.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhum registro encontrado
              </div>
            ) : (
              <>
                {/* Tabela Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atendente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resumo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {registros.map((registro) => {
                        const dataFormatada = formatarData(registro.data_hora_envio);
                        const atendente = registro.login_atendente || "-";
                        const numeroCartao =
                          registro.emissao?.numero_cartao ||
                          registro.biometria?.numero_cartao ||
                          "-";
                        const cpf = registro.biometria?.cpf;
                        const tipoInfo = registro.informacao?.tipo_informacao;
                        const tipoServico = registro.servico?.tipo_servico;

                        return (
                          <tr
                            key={registro.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/registro/${registro.id}`)}
                          >
                            <td className="px-6 py-4 text-sm text-gray-900">
                              #{registro.id}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(registro.tipo_atendimento)}`}>
                                {registro.tipo_atendimento}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {dataFormatada}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {atendente}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 space-y-1">
                              {numeroCartao !== "-" && <div>Cartão: {numeroCartao}</div>}
                              {cpf && <div>CPF: {cpf}</div>}
                              {tipoInfo && <div>Informação: {tipoInfo}</div>}
                              {tipoServico && <div>Serviço: {tipoServico}</div>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Cards Mobile */}
                <div className="md:hidden">
                  {registros.map((registro) => {
                    const dataFormatada = formatarData(registro.data_hora_envio);
                    const atendente = registro.login_atendente || "-";

                    return (
                      <div
                        key={registro.id}
                        className="border-b p-4 cursor-pointer"
                        onClick={() => navigate(`/registro/${registro.id}`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-900">#{registro.id}</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(registro.tipo_atendimento)}`}>
                            {registro.tipo_atendimento}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{dataFormatada}</p>
                        <p className="text-sm text-gray-600">
                          Atendente: {atendente}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Paginação */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                  <div className="text-sm text-gray-600">
                    Página {paginaAtual} de {totalPaginas}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={paginaAnterior}
                      disabled={paginaAtual === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      ← Anterior
                    </button>
                    
                    <button
                      onClick={proximaPagina}
                      disabled={paginaAtual >= totalPaginas}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Próxima →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
