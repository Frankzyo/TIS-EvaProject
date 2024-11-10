// App.js
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Pages/Login";
import Proyectos from "./Pages/Proyectos";
import HomePage from "./Pages/HomePage";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import ProyectoEstudiante from "./Pages/ProyectoEstudiante";
import PlanificacionEstudiante from "./Pages/PlanificacionEstudiante";
import HistoriaUsuario from "./Pages/HistoriaUsuario";
import Perfil from "./Pages/Perfil";
import PerfilEstudiante from "./Pages/PerfilEstudiante";
import ApproveAccounts from "./Pages/ApproveAccounts";
import Grupos from "./Pages/Grupos";
import Estudiantes from "./Pages/Estudiantes"; // Importa el nuevo componente
import EquipoEstudiante from "./Pages/EquipoEstudiante";
import TareasEstudiante from "./Pages/TareasEstudiante";
import "../css/NotFound.css"; // Importa el archivo CSS para la página NotFound
import HomeDocente from "./Pages/HomeDocente";

function NotFound() {
    return (
        <div className="notfound-container">
            <div className="notfound-illustration"></div>
            <h1 className="notfound-title">
                Oops... ¡Estamos construyendo esta página!
            </h1>
            <p className="notfound-message">
                Parece que te has adelantado un poco, esta sección está en
                construcción. ¡Vuelve pronto para ver lo nuevo!
            </p>
            <a href="/" className="notfound-link">
                Llévame a casa
            </a>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/proyectos" element={<Proyectos />} />
                <Route
                    path="/proyectos/:projectId/grupos/:groupId/estudiantes"
                    element={<Estudiantes />}
                />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                    path="/proyecto-estudiante"
                    element={<ProyectoEstudiante />}
                />
                <Route
                    path="/planificacion-estudiante"
                    element={<PlanificacionEstudiante />}
                />
                <Route
                    path="/historia-usuario/:id"
                    element={<HistoriaUsuario />}
                />
                <Route path="/perfil" element={<Perfil />} />
                <Route
                    path="/perfil-estudiante"
                    element={<PerfilEstudiante />}
                />
                <Route path="/approve-accounts" element={<ApproveAccounts />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                    path="/equipo-estudiante"
                    element={<EquipoEstudiante />}
                />
                <Route
                    path="/tareas-estudiante"
                    element={<TareasEstudiante />}
                />
                <Route path="*" element={<NotFound />} />
                <Route path="/home-docente/:id" element={<HomeDocente />} />
            </Routes>
        </Router>
    );
}

const rootElement = document.getElementById("app");
const root = createRoot(rootElement);
root.render(<App />);
