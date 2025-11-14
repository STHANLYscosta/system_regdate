import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Selecionar from './pages/Selecionar';
import Emissao from './pages/Emissao';
import Biometria from './pages/Biometria';
import Informacao from './pages/Informacao';
import Servico from './pages/Servico';
import Registros from './pages/Registros';
import DetalhesRegistro from './pages/DetalhesRegistro';
import PrivateRoute from "./routes/PrivateRoute";
import Dashboard from './pages/Dashboard';



function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rota pública */}
        <Route path="/" element={<Login />} />

        {/* Rotas protegidas */}
        <Route
          path="/selecionar"
          element={
            <PrivateRoute>
              <Selecionar />
            </PrivateRoute>
          }
        />

        <Route
          path="/emissao"
          element={
            <PrivateRoute>
              <Emissao />
            </PrivateRoute>
          }
        />

        <Route
          path="/biometria"
          element={
            <PrivateRoute>
              <Biometria />
            </PrivateRoute>
          }
        />

        <Route
          path="/informacao"
          element={
            <PrivateRoute>
              <Informacao />
            </PrivateRoute>
          }
        />

        <Route
          path="/servico"
          element={
            <PrivateRoute>
              <Servico />
            </PrivateRoute>
          }
        />

        <Route
          path="/registros"
          element={
            <PrivateRoute>
              <Registros />
            </PrivateRoute>
          }
        />
        <Route
          path="/registro/:id"
          element={
            <PrivateRoute>
              <DetalhesRegistro />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />










      </Routes>
    </BrowserRouter>
  );
}

export default App;
