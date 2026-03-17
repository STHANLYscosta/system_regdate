import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/auth';

// Importação das Páginas
import Login from './pages/Login';
import Selecionar from './pages/Selecionar';
import FormularioAtendimento from './pages/FormularioAtendimento';
import Dashboard from './pages/Dashboard';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import GerenciarPostos from './pages/GerenciarPostos';

// Componente para proteger rotas (só acessa se estiver logado)
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" />;
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
        <Route path="/usuarios" element={<PrivateRoute><GerenciarUsuarios /></PrivateRoute>} />
        <Route path="/postos" element={<PrivateRoute><GerenciarPostos /></PrivateRoute>} />
        
        {/* Redireciona qualquer rota inexistente para o login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;