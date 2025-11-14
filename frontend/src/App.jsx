
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Selecionar from './pages/Selecionar';
import Emissao from './pages/Emissao';
import Biometria from './pages/Biometria';
import Informacao from './pages/Informacao';
import Servico from './pages/Servico';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/selecionar" element={<Selecionar />} />
        <Route path="/emissao" element={<Emissao />} />
        <Route path="/biometria" element={<Biometria />} />
        <Route path="/informacao" element={<Informacao />} />
        <Route path="/servico" element={<Servico />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;