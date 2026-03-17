import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listarRegistroPorId } from "../services/registros";

export default function DetalhesRegistro() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [registro, setRegistro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const formatarData = (dataISO) => {
    if (!dataISO) return "-";
    const data = new Date(dataISO);
    return data.toLocaleString("pt-BR");
  };

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        setErro("");
        const data = await listarRegistroPorId(id);
        setRegistro(data);
      } catch (e) {
        console.error(e);
        setErro("Erro ao carregar detalhes do registro.");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [id]);

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  if (erro) {
    return <div className="p-6 text-red-600">{erro}</div>;
  }

  if (!registro) {
    return <div className="p-6">Registro não encontrado</div>;
  }

  // Campos principais
  const dataFormatada = formatarData(registro.data_hora_envio);
  const atendente = registro.login_atendente || "-";

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/registros")}
          className="px-4 py-2 mb-6 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Voltar
        </button>

        <div className="bg-white rounded shadow p-6">
          <h1 className="text-2xl font-bold mb-4">
            Registro #{registro.id}
          </h1>

          <div className="space-y-1 text-sm text-gray-700">
            <p><strong>Tipo:</strong> {registro.tipo_atendimento}</p>
            <p><strong>Data/Hora:</strong> {dataFormatada}</p>
            <p><strong>Atendente:</strong> {atendente}</p>
            <p><strong>Posto/Local:</strong> {registro.id_local_posto}</p>
          </div>

          <hr className="my-4" />

          {/* EMISSÃO */}
          {registro.emissao && (
            <div className="mb-4">
              <h2 className="font-bold text-lg mb-1">Dados da Emissão</h2>
              <p><strong>Número do Cartão:</strong> {registro.emissao.numero_cartao}</p>
              <p><strong>Tipo de Cartão:</strong> {registro.emissao.tipo_cartao}</p>
            </div>
          )}

          {/* BIOMETRIA */}
          {registro.biometria && (
            <div className="mb-4">
              <h2 className="font-bold text-lg mb-1">Dados da Biometria</h2>
              <p><strong>CPF:</strong> {registro.biometria.cpf}</p>
              <p><strong>Número do Cartão:</strong> {registro.biometria.numero_cartao}</p>
              <p><strong>Tipo de Biometria:</strong> {registro.biometria.tipo_biometria}</p>
              {registro.biometria.descricao && (
                <p><strong>Descrição:</strong> {registro.biometria.descricao}</p>
              )}
            </div>
          )}

          {/* INFORMAÇÃO */}
          {registro.informacao && (
            <div className="mb-4">
              <h2 className="font-bold text-lg mb-1">Informação</h2>
              <p><strong>Tipo de Informação:</strong> {registro.informacao.tipo_informacao}</p>
            </div>
          )}

          {/* SERVIÇO */}
          {registro.servico && (
            <div className="mb-4">
              <h2 className="font-bold text-lg mb-1">Serviço / Triagem</h2>
              <p><strong>Tipo de Serviço:</strong> {registro.servico.tipo_servico}</p>
            </div>
          )}

          <button
            onClick={() => window.print()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🖨 Imprimir / Gerar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
