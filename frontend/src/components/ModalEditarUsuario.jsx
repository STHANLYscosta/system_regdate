import { useState } from "react";
import { atualizarUsuario } from "../services/usuarios";

export default function ModalEditarUsuario({ usuario, onClose, onSaved }) {
  const [firstName, setFirstName] = useState(usuario.first_name);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(usuario.role);
  const [ativo, setAtivo] = useState(usuario.is_active);

  const salvar = async () => {
    const data = {
      first_name: firstName,
      role,
      is_active: ativo,
    };

    if (password) {
      data.password = password;
    }

    await atualizarUsuario(usuario.id, data);

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">

        <h2 className="text-xl font-bold mb-4">Editar Usuário</h2>

        <label className="block mt-2 text-sm font-semibold">Login</label>
        <input
          disabled
          className="border p-2 rounded w-full bg-gray-100"
          value={usuario.username}
        />

        <label className="block mt-2 text-sm font-semibold">Nome</label>
        <input
          className="border p-2 rounded w-full"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <label className="block mt-2 text-sm font-semibold">
          Nova Senha (opcional)
        </label>
        <input
          type="password"
          className="border p-2 rounded w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="block mt-2 text-sm font-semibold">Papel</label>
        <select
          className="border p-2 rounded w-full"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="ATENDENTE">ATENDENTE</option>
          <option value="SUPERVISOR">SUPERVISOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <label className="block mt-4 text-sm font-semibold">Status</label>
        <select
          className="border p-2 rounded w-full"
          value={ativo ? "1" : "0"}
          onChange={(e) => setAtivo(e.target.value === "1")}
        >
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </select>

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={salvar}
          >
            Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
}
