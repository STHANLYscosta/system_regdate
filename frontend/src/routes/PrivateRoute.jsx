import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/auth";

export default function PrivateRoute({ children }) {
  // Se NÃO estiver logado → manda para o login
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  // Se estiver logado → libera a rota
  return children;
}
