import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from './services/auth';

// Importação das Páginas
import Login from './pages/Login';
import Selecionar from './pages/Selecionar';
import FormularioAtendimento from './pages/FormularioAtendimento';
import Dashboard from './pages/Dashboard';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import GerenciarPostos from './pages/GerenciarPostos';
import GerenciarPermissoes from './pages/GerenciarPermissoes';
import Perfil from './pages/Perfil';

// Componente para proteger rotas (só acessa se estiver logado)
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" />;
};

// Componente para proteger rotas por nível de acesso
const RoleRoute = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) return <Navigate to="/" />;
  const role = getUserRole();
  if (!allowedRoles.includes(role)) return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota Pública */}
        <Route path="/" element={<Login />} />

        {/* Rotas Privadas */}
        <Route path="/selecionar" element={<PrivateRoute><Selecionar /></PrivateRoute>} />
        <Route path="/atendimento" element={<PrivateRoute><FormularioAtendimento /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/usuarios" element={<RoleRoute allowedRoles={['GERENTE', 'SUPERVISOR']}><GerenciarUsuarios /></RoleRoute>} />
        <Route path="/postos" element={<RoleRoute allowedRoles={['GERENTE', 'SUPERVISOR']}><GerenciarPostos /></RoleRoute>} />
        <Route path="/permissoes" element={<RoleRoute allowedRoles={['GERENTE']}><GerenciarPermissoes /></RoleRoute>} />
        <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
        
        {/* Redireciona qualquer rota inexistente para o login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;