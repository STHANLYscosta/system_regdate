import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // KPIs
  const [totalGeral, setTotalGeral] = useState(0);
  const [porTipo, setPorTipo] = useState([]);
  const [porPosto, setPorPosto] = useState([]);
  const [porAtendente, setPorAtendente] = useState([]);
  const [porDia, setPorDia] = useState([]);
  const [porHora, setPorHora] = useState([]);

  // Filtros
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [periodo, setPeriodo] = useState("30"); // 1, 7, 30, custom
  const [tipo, setTipo] = useState("");
  const [posto, setPosto] = useState("");
  const [atendente, setAtendente] = useState("");

  const cores = [
    "#1d4ed8",
    "#16a34a",
    "#f59e0b",
    "#8b5cf6",
    "#dc2626",
    "#0ea5e9",
    "#22c55e",
    "#ca8a04",
  ];

  // Aplica o período rápido (hoje, 7 dias, 30 dias)
  const aplicarPeriodoRapido = (valor) => {
    setPeriodo(valor);

    if (valor === "custom") {
      // não mexe nas datas, usuário define
      return;
    }

    const hoje = new Date();
    const fim = hoje.toISOString().slice(0, 10);

    let inicio = new Date();
    if (valor === "1") {
      // hoje
      inicio = hoje;
    } else if (valor === "7") {
      inicio.setDate(hoje.getDate() - 7);
    } else if (valor === "30") {
      inicio.setDate(hoje.getDate() - 30);
    }

    const ini = inicio.toISOString().slice(0, 10);
    setDataIni(ini);
    setDataFim(fim);
  };

  const montarParams = () => {
    const params = {};
    if (dataIni) params.data_ini = dataIni;
    if (dataFim) params.data_fim = dataFim;
    if (tipo) params.tipo = tipo;
    if (posto) params.posto = posto;
    if (atendente) params.atendente = atendente;
    return params;
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      const params = montarParams();

      const [
        totalRes,
        tipoRes,
        postoRes,
        atendenteRes,
        diaRes,
        horaRes,
      ] = await Promise.all([
        api.get("dashboard/total-geral/", { params }),
        api.get("dashboard/tipo/", { params }),
        api.get("dashboard/posto/", { params }),
        api.get("dashboard/atendente/", { params }),
        api.get("dashboard/dia/", { params }),
        api.get("dashboard/hora/", { params }),
      ]);

      setTotalGeral(totalRes.data.total || 0);
      setPorTipo(tipoRes.data || []);
      setPorPosto(postoRes.data || []);
      setPorAtendente(atendenteRes.data || []);
      setPorDia(diaRes.data || []);
      setPorHora(horaRes.data || []);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carrega período padrão (últimos 30 dias)
    aplicarPeriodoRapido("30");
    // Depois que datas estiverem setadas, chama carregarDados
  }, []);

  useEffect(() => {
    // Sempre que datas mudarem (via período rápido), recarrega
    if (periodo !== "custom" && dataIni && dataFim) {
      carregarDados();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataIni, dataFim]);

  const aplicarFiltros = () => {
    carregarDados();
  };

  const formatDia = (d) => {
    if (!d) return "";
    // Se vier como '2025-02-15', já tá ok
    return d;
  };

  const formatHora = (h) => {
    if (h === null || h === undefined) return "";
    return `${h}h`;
  };

  // Ordenar porAtendente desc para ADMIN
  const atendentesOrdenados = [...porAtendente].sort(
    (a, b) => (b.total || 0) - (a.total || 0)
  );

  const topAtendentes = atendentesOrdenados.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard de Atendimentos
            </h1>
            <p className="text-sm text-gray-500">
              Indicadores por posto, atendente, dia e tipo de atendimento
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/selecionar")}
              className="px-3 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              ← Voltar ao menu
            </button>
            <button
              onClick={() => navigate("/registros")}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Ver Registros
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* FILTROS */}
        <section className="bg-white p-4 rounded-lg shadow flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Período rápido
              </label>
              <select
                value={periodo}
                onChange={(e) => aplicarPeriodoRapido(e.target.value)}
                className="border p-2 rounded text-sm"
              >
                <option value="1">Hoje</option>
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Data inicial
              </label>
              <input
                type="date"
                className="border p-2 rounded text-sm"
                value={dataIni}
                onChange={(e) => {
                  setPeriodo("custom");
                  setDataIni(e.target.value);
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Data final
              </label>
              <input
                type="date"
                className="border p-2 rounded text-sm"
                value={dataFim}
                onChange={(e) => {
                  setPeriodo("custom");
                  setDataFim(e.target.value);
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Tipo de atendimento
              </label>
              <select
                className="border p-2 rounded text-sm"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="EMISSAO">Emissão</option>
                <option value="BIOMETRIA">Biometria</option>
                <option value="INFORMACAO">Informação</option>
                <option value="SERVICO">Serviço</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Posto (ID)
              </label>
              <input
                type="text"
                placeholder="Ex: 10"
                className="border p-2 rounded text-sm w-24"
                value={posto}
                onChange={(e) => setPosto(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Atendente (login)
              </label>
              <input
                type="text"
                placeholder="login"
                className="border p-2 rounded text-sm"
                value={atendente}
                onChange={(e) => setAtendente(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={aplicarFiltros}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Aplicar filtros
            </button>
          </div>
        </section>

        {/* LOADING */}
        {loading && (
          <section className="bg-white p-6 rounded-lg shadow text-gray-500">
            Carregando dados do dashboard...
          </section>
        )}

        {/* CONTEÚDO PRINCIPAL */}
        {!loading && (
          <>
            {/* KPIs */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <p className="text-xs text-gray-500">Total de atendimentos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalGeral}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow text-center">
                <p className="text-xs text-gray-500">Postos com atendimento</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {porPosto.length}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow text-center">
                <p className="text-xs text-gray-500">Atendentes ativos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {porAtendente.length}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow text-center">
                <p className="text-xs text-gray-500">Tipos de atendimento</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {porTipo.length}
                </p>
              </div>
            </section>

            {/* LINHA 1: Tipo + Posto */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Por Tipo */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                  Atendimentos por Tipo
                </h2>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={porTipo}
                        dataKey="total"
                        nameKey="tipo_atendimento"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {porTipo.map((_, index) => (
                          <Cell
                            key={index}
                            fill={cores[index % cores.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Por Posto */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                  Atendimentos por Posto
                </h2>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porPosto}>
                      <XAxis dataKey="id_local_posto" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* LINHA 2: Por Dia + Por Hora */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Por Dia */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                  Atendimentos por Dia
                </h2>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={porDia}>
                      <XAxis dataKey="dia" tickFormatter={formatDia} />
                      <YAxis />
                      <Tooltip />
                      <Line
                        dataKey="total"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Por Hora */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                  Atendimentos por Hora
                </h2>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porHora}>
                      <XAxis dataKey="hora" tickFormatter={formatHora} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* MÓDULO ADMIN: Desempenho por atendente */}
            <section className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-700">
                  Desempenho por Atendente (TOP 5)
                </h2>
                <span className="text-xs text-gray-400">
                  Módulo ADMIN – análise de produtividade
                </span>
              </div>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topAtendentes}>
                    <XAxis dataKey="login_atendente" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total">
                      {topAtendentes.map((_, index) => (
                        <Cell
                          key={index}
                          fill={cores[index % cores.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Dica: use os filtros de período, posto e tipo para analisar
                desempenho individual e comparar atendentes.
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
