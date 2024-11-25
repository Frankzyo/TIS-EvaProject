import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderProyecto from "../Components/HeaderProyecto";
import SidebarPrueba from "../Components/SidebarPrueba";
import "../../css/HeaderProyecto.css";
import "../../css/SidebarPrueba.css";
import "../../css/EvaluacionIndividualEstudiante.css";
import axios from "axios";

const EvaluacionIndividualEstudiante = () => {
    const { projectId } = useParams();
    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        // Obtener los detalles del proyecto
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

        fetchProjectDetails();
    }, [projectId]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    return (
        <div
            className={`evaluacion-individual-estudiante-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderProyecto />
            <div className="evaluacion-individual-estudiante-sidebar-content">
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                />
                <div className="evaluacion-individual-estudiante-container">
                    <div className="evaluacion-individual-estudiante-header">
                        <h2>Planilla de Seguimiento</h2>
                        <button className="new-project-btn">
                            <i className="fas fa-plus"></i> Nueva Etapa
                        </button>
                    </div>
                    <div className="evaluacion-individual-estudiante"></div>
                </div>
            </div>
        </div>
    );
};

export default EvaluacionIndividualEstudiante;
