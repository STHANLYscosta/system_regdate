import { useState } from "react";
import { criarUsuario } from "../services/usuarios";

export default function ModalNovoUsuario({ onClose, onSaved }) {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ATENDENTE");

  const salvar = async () => {
    if (!username || !password) {
      alert("Login e senha são obrigatórios");
      return;
    }

    await criarUsuario({
      username,
      first_name: firstName,
      password,
      role,
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">

        <h2 className="text-xl font-bold mb-4">Novo Usuário</h2>

        <label className="block mt-2 text-sm font-semibold">Login</label>
        <input
          className="border p-2 rounded w-full"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="block mt-2 text-sm font-semibold">Nome</label>
        <input
          className="border p-2 rounded w-full"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <label className="block mt-2 text-sm font-semibold">Senha</label>
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

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={salvar}
          >
            Salvar
          </button>
        </div>

      </div>
    </div>
  );
}
