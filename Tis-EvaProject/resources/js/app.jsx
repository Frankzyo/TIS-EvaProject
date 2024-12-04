// App.js
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../css/NotFound.css";

// Importación de componentes
import HomePage from "./Pages/HomePage/HomePage";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import ResetPassword from "./Pages/Auth/ResetPassword";

// Rutas de proyectos
import Proyectos from "./Pages/ProyectoPage/Proyectos";
import Grupos from "./Pages/GruposPage/Grupos";
import Estudiantes from "./Pages/EstudiantePage/Estudiantes";
import AgregarEstudiante from "./Pages/EstudiantePage/AgregarEstudiante";
import Rubrica from "./Pages/EtapasPage/Rubrica";

// Rutas de estudiantes
import ProyectoEstudiante from "./Pages/EstudiantePage/ProyectoEstudiante";
import PlanificacionEstudiante from "./Pages/PlanificacionPage/PlanificacionEstudiante";
import HistoriaUsuario from "./Pages/PlanificacionPage/HistoriaUsuario";
import PerfilEstudiante from "./Pages/EstudiantePage/PerfilEstudiante";
import EquipoEstudiante from "./Pages/EstudiantePage/EquipoEstudiante";
import TareasEstudiante from "./Pages/EstudiantePage/TareasEstudiante";

// Rutas docentes
import RequerimientosDocente from "./Pages/DocentePage/RequerimientosDocente";
import PlanillaDeSeguimiento from "./Pages/DocentePage/PlanilaDeSeguimiento";
import EvaluacionIndividual from "./Pages/EvaluacionesPage/EvaluacionIndividual";
import EvaluacionGrupoIndividual from "./Pages/EvaluacionesPage/EvaluacionGrupoIndividual";
import EvaluacionIndividualEstudiante from "./Pages/EvaluacionesPage/EvaluacionIndividualEstudiante";
import EvaluacionDePares from "./Pages/EvaluacionesPage/EvaluacionDePares";
import EvaluacionCruzada from "./Pages/EvaluacionesPage/EvaluacionCruzada";

// Rutas de aprobación
import ApproveAccounts from "./Pages/Auth/ApproveAccounts";
import ApproveEstudiante from "./Pages/Auth/ApproveEstudiante";

// Rutas de grupos y gestión
import GrupoEstudiante from "./Pages/GruposPage/GrupoEstudiante";
import Etapas from "./Pages/EtapasPage/Etapas";

// Componente para manejar rutas no encontradas
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
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Proyectos */}
                <Route path="/proyectos" element={<Proyectos />} />
                <Route path="/grupos/:projectId" element={<Grupos />} />
                <Route
                    path="/proyectos/:projectId/grupos-estudiante"
                    element={<GrupoEstudiante />}
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

                {/* Estudiantes */}
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
                <Route
                    path="/perfil-estudiante"
                    element={<PerfilEstudiante />}
                />
                <Route
                    path="/equipo-estudiante"
                    element={<EquipoEstudiante />}
                />
                <Route
                    path="/tareas-estudiante"
                    element={<TareasEstudiante />}
                />

                {/* Docentes */}
                <Route
                    path="/requerimientos/:projectId"
                    element={<RequerimientosDocente />}
                />
                <Route
                    path="/planilla-seguimiento/:projectId"
                    element={<PlanillaDeSeguimiento />}
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
                <Route
                    path="/evaluacion-de-pares/:projectId"
                    element={<EvaluacionDePares />}
                />
                <Route
                    path="/evaluacion-cruzada/:projectId"
                    element={<EvaluacionCruzada />}
                />

                {/* Aprobación */}
                <Route path="/approve-accounts" element={<ApproveAccounts />} />
                <Route
                    path="/approve-estudiante"
                    element={<ApproveEstudiante />}
                />
                <Route
                    path="/etapas-proyecto/:projectId"
                    element={<Etapas />}
                />
                <Route
                    path="/proyectos/:projectId/rubrica/:etapaId"
                    element={<Rubrica />}
                />
                {/* Ruta para páginas no encontradas */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

const rootElement = document.getElementById("app");
const root = createRoot(rootElement);
root.render(<App />);
