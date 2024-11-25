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
import ApproveEstudiante from "./Pages/ApproveEstudiante";
import Grupos from "./Pages/Grupos";
import GrupoEstudiante from "./Pages/GrupoEstudiante";
import Estudiantes from "./Pages/Estudiantes";
import AgregarEstudiante from "./Pages/AgregarEstudiante";
import EquipoEstudiante from "./Pages/EquipoEstudiante";
import TareasEstudiante from "./Pages/TareasEstudiante";
import RequerimientosDocente from "./Pages/RequerimientosDocente";
import Etapas from "./Pages/Etapas";
import PlanillaDeSeguimiento from "./Pages/PlanilaDeSeguimiento";
import Rubrica from "./Pages/Rubrica";
import EvaluacionIndividual from "./Pages/EvaluacionIndividual";
import EvaluacionGrupoIndividual from "./Pages/EvaluacionGrupoIndividual";
import EvaluacionIndividualEstudiante from "./Pages/EvaluacionIndividualEstudiante";
import "../css/NotFound.css";

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
                <Route path="/grupos/:projectId" element={<Grupos />} />
                <Route
                    path="/proyectos/:projectId/grupos-estudiante"
                    element={<GrupoEstudiante />}
                />
                <Route
                    path="/requerimientos/:projectId"
                    element={<RequerimientosDocente />}
                />
                <Route
                    path="/proyectos/:projectId/grupos/:groupId/estudiantes"
                    element={<Estudiantes />}
                />
                <Route
                    path="/proyectos/:projectId/grupos/:groupId/agregar-estudiante"
                    element={<AgregarEstudiante />}
                />
                <Route
                    path="/proyectos/:projectId/rubrica/:etapaId"
                    element={<Rubrica />}
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
                <Route
                    path="/approve-estudiante"
                    element={<ApproveEstudiante />}
                />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                    path="/equipo-estudiante"
                    element={<EquipoEstudiante />}
                />
                <Route
                    path="/tareas-estudiante"
                    element={<TareasEstudiante />}
                />
                <Route
                    path="/planilla-seguimiento/:projectId"
                    element={<PlanillaDeSeguimiento />}
                />
                <Route
                    path="/etapas-proyecto/:projectId"
                    element={<Etapas />}
                />
                <Route
                    path="/evaluacion-individual/:projectId"
                    element={<EvaluacionIndividual />}
                />
                <Route
                    path="/evaluacion-individual/:projectId/:examenId"
                    element={<EvaluacionGrupoIndividual />}
                />
                <Route
                    path="/evaluacion-estudiante/:projectId/:examenId/:estudianteId/:etapaId"
                    element={<EvaluacionIndividualEstudiante />}
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

const rootElement = document.getElementById("app");
const root = createRoot(rootElement);
root.render(<App />);
