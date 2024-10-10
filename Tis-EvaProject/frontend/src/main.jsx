import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login/Login.jsx';
import Proyecto from './pages/Proyectos/Proyecto.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/proyecto" element={<Proyecto />} />
      </Routes>
    </Router>
  </StrictMode>
);
