import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import SidebarPrueba from "../../Components/ComponenteSidebar/SidebarPrueba";
import DetallesExamen from "../../Components/ComponentsEvaluacionGrupoIndividual/DetallesExamen";
import ListaEstudiantes from "../../Components/ComponentsEvaluacionGrupoIndividual/ListaEstudiantes";
import PlanillaEvaGrupoIndividual from "../../Components/ComponentsEvaluacionGrupoIndividual/PlanillaEvaGrupoIndividual";
import SeleccionarEstudianteAleatorio from "../../Components/ComponentsEvaluacionGrupoIndividual/SeleccionarEstudianteAleatorio";
import "../../../css/EstilosHeader/HeaderProyecto.css";
import "../../../css/EstilosSidebar/SidebarPrueba.css";
import "../../../css/EstilosEvaluaciones/EvaluacionGrupoIndividual.css";

const EvaluacionGrupoIndividual = () => {
    const { projectId, examenId } = useParams();
    const navigate = useNavigate();

    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [examenDetails, setExamenDetails] = useState(null);
    const [estudiantesGrupo, setEstudiantesGrupo] = useState([]);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/proyectos/${projectId}`,
                    { withCredentials: true }
                );
                setProjectDetails(response.data);
            } catch (error) {
                console.error("Error al cargar el proyecto:", error);
            }
        };

        const fetchExamenDetails = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/evaluaciones-individuales/${examenId}`,
                    { withCredentials: true }
                );
                setExamenDetails(response.data);

                if (response.data?.ID_GRUPO) {
                    const estudiantesResponse = await axios.get(
                        `http://localhost:8000/api/estudiantes/grupo/${response.data.ID_GRUPO}`,
                        { withCredentials: true }
                    );
                    setEstudiantesGrupo(estudiantesResponse.data || []);
                }
            } catch (error) {
                console.error(
                    "Error al cargar detalles del examen o estudiantes:",
                    error
                );
            }
        };

        fetchProjectDetails();
        fetchExamenDetails();
    }, [projectId, examenId]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const handleEvaluarEstudiante = (estudianteId) => {
        if (examenDetails?.ID_ETAPA) {
            navigate(
                `/evaluacion-estudiante/${projectId}/${examenId}/${estudianteId}/${examenDetails.ID_ETAPA}`
            );
        } else {
            console.error("No se encontró ID_ETAPA en examenDetails");
        }
    };

    return (
        <div
            className={`evaluacion-grupo-individual-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderProyecto />
            <div className="evaluacion-grupo-individual-sidebar-content">
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={
                        projectDetails?.PORTADA_PROYECTO
                            ? `http://localhost:8000/storage/${projectDetails.PORTADA_PROYECTO}`
                            : ""
                    }
                    projectId={projectId}
                />
                <div className="evaluacion-grupo-individual-sidebar-container">
                    <div className="evaluacion-grupo-individual-header">
                        <h2>
                            Evaluación Individual de{" "}
                            {examenDetails?.etapaNombre}{" "}
                        </h2>
                    </div>
                    <DetallesExamen examenDetails={examenDetails} />

                    <SeleccionarEstudianteAleatorio
                        grupoId={examenDetails?.ID_GRUPO}
                    />

                    <ListaEstudiantes
                        estudiantes={estudiantesGrupo}
                        etapaId={examenDetails?.ID_ETAPA}
                        idGrupo={examenDetails?.ID_GRUPO}
                        onEvaluarEstudiante={handleEvaluarEstudiante}
                    />
                </div>
            </div>
        </div>
    );
};

export default EvaluacionGrupoIndividual;
