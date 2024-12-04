import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarEstudiante from "../../Components/ComponenteSidebar/SidebarEstudiante";
import Header from "../../Components/ComponenteHeader/HeaderEstudiante";
import useProjectAndGroupId from "../../Components/useProjectAndGroupId";
import axios from "axios";
import "../../../css/EstilosPlanificacion/PlanificacionEstudiante.css";
import "../../../css/EstilosSidebar/SidebarEstudiante.css";
import "../../../css/EstilosEstudiante/TareasEstudiante.css";
const TareasEstudiante = () => {
    const navigate = useNavigate();
    const [proyecto, setProyecto] = useState(null);
    const [grupo, setGrupo] = useState(null);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { projectId, groupId } = useProjectAndGroupId();
    const [isRepresentanteLegal, setIsRepresentanteLegal] = useState(false);
    useEffect(() => {
        const role = localStorage.getItem("ROLE");
        const estudianteId = localStorage.getItem("ID_EST");
        const representanteLegal = localStorage.getItem("IS_RL");

        if (role !== "Estudiante" || !estudianteId) {
            navigate("/login");
        }

        setIsRepresentanteLegal(representanteLegal === "true");
    }, [navigate]);
    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);
    useEffect(() => {
        const obtenerDatosEstudiante = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/estudiante/proyecto-grupo",
                    { withCredentials: true }
                );
                console.log("Datos del estudiante:", response.data);

                if (response.data) {
                    setProyecto(response.data.proyecto);
                    setGrupo(response.data.grupo);
                }
            } catch (error) {
                console.error(
                    "Error al cargar los datos del estudiante:",
                    error
                );
            }
        };

        obtenerDatosEstudiante();
    }, []);
    return (
        <div
            className={`tareas-estudiante-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <Header />
            <div className="tareas-estudiante-sidebar-content">
                <SidebarEstudiante
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={proyecto?.NOMBRE_PROYECTO} // Campo del nombre del proyecto
                    fotoProyecto={`http://localhost:8000/storage/${proyecto?.PORTADA_PROYECTO}`} // Ruta completa de la imagen
                    projectId={projectId}
                    groupId={groupId}
                    isRepresentanteLegal={isRepresentanteLegal}
                />
                <div className="tareas-estudiante-main-content">
                    <h1 className="tareas-estudiante-title">
                        Tareas Estudiante
                    </h1>
                    {/* Aquí puedes añadir el contenido específico de la página de tareas */}
                </div>
            </div>
        </div>
    );
};

export default TareasEstudiante;
