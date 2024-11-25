import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderProyecto from "../Components/HeaderProyecto";
import SidebarPrueba from "../Components/SidebarPrueba";
import "../../css/HeaderProyecto.css";
import "../../css/SidebarPrueba.css";
import "../../css/EvaluacionGrupoIndividual.css";
import axios from "axios";

const EvaluacionGrupoIndividual = () => {
    const { projectId, examenId } = useParams(); // Obtener IDs de la URL
    const navigate = useNavigate();
    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [examenDetails, setExamenDetails] = useState(null); // Detalles del examen
    const [estudiantesGrupo, setEstudiantesGrupo] = useState([]); // Lista de estudiantes del grupo

    useEffect(() => {
        // Obtener detalles del proyecto
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

        // Obtener detalles del examen y los estudiantes del grupo
        const fetchExamenDetails = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/evaluaciones-individuales/${examenId}`,
                    { withCredentials: true }
                );
                setExamenDetails(response.data);

                // Obtener los estudiantes del grupo
                console.log("Detalles del examen:", response.data);
                if (response.data?.ID_GRUPO) {
                    const estudiantesResponse = await axios.get(
                        `http://localhost:8000/api/estudiantes/grupo/${response.data.ID_GRUPO}`,
                        { withCredentials: true }
                    );
                    console.log(
                        "Estudiantes del grupo:",
                        estudiantesResponse.data
                    );
                    setEstudiantesGrupo(estudiantesResponse.data || []);
                }
            } catch (error) {
                console.error(
                    "Error al cargar los detalles del examen o los estudiantes del grupo:",
                    error
                );
            }
        };

        fetchProjectDetails();
        fetchExamenDetails();
    }, [projectId, examenId]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const handleEvaluarEstudiante = (estudianteId) => {
        if (examenDetails && examenDetails.ID_ETAPA) {
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
                            Evaluación de {examenDetails?.etapaNombre}{" "}
                            Individual
                        </h2>
                    </div>

                    {/* Contenedor de detalles del examen */}
                    <div className="evaluacion-grupo-individual-details">
                        {examenDetails ? (
                            <>
                                <div className="grupo-foto-container">
                                    {examenDetails.PORTADA_GRUPO ? (
                                        <img
                                            src={examenDetails.PORTADA_GRUPO}
                                            alt={`Foto de ${examenDetails.grupoNombre}`}
                                            className="grupo-fotos"
                                        />
                                    ) : (
                                        <img
                                            src="https://via.placeholder.com/50"
                                            alt="Foto de grupo no disponible"
                                            className="grupo-fotos"
                                        />
                                    )}
                                </div>

                                <div className="evaluacion-grupo-individual-details-content">
                                    <h3>Grupo: {examenDetails.grupoNombre}</h3>
                                    <p>
                                        <strong>Etapa:</strong>{" "}
                                        {examenDetails.etapaNombre}
                                    </p>
                                    <p>
                                        <strong>Día de Defensa:</strong>{" "}
                                        {examenDetails.defensaDia ||
                                            "No asignado"}
                                    </p>
                                    <p>
                                        <strong>Hora de Defensa:</strong>{" "}
                                        {examenDetails.defensaHora ||
                                            "No asignado"}
                                    </p>
                                    {examenDetails.representanteLegal && (
                                        <div className="representante-info">
                                            <h4>Representante Legal:</h4>
                                            <p>
                                                {
                                                    examenDetails
                                                        .representanteLegal
                                                        .nombre
                                                }{" "}
                                                {
                                                    examenDetails
                                                        .representanteLegal
                                                        .apellido
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p>Cargando detalles de la evaluación...</p>
                        )}
                    </div>

                    {/* Nuevo contenedor para la lista de estudiantes */}
                    <div className="estudiantes-grupo-container">
                        <h3>Estudiantes del Grupo</h3>
                        {estudiantesGrupo.length > 0 ? (
                            estudiantesGrupo.map((estudiante, index) => {
                                const fotoUrl = `http://localhost:8000/storage/${
                                    estudiante.FOTO_EST ||
                                    "profile_photos/placeholder.jpg"
                                }`;

                                return (
                                    <div
                                        key={index}
                                        className="estudiante-item"
                                    >
                                        <div className="estudiante-info">
                                            <img
                                                src={fotoUrl}
                                                alt={`Foto de ${estudiante.NOMBRE_EST}`}
                                                className="estudiante-foto"
                                            />
                                            <div className="estudiante-texto">
                                                <p className="estudiante-nombre">
                                                    {estudiante.NOMBRE_EST}{" "}
                                                    {estudiante.APELLIDO_EST}
                                                </p>
                                                <p className="estudiante-rol">
                                                    {estudiante.ROL_EST}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Controles adicionales: Evaluar, Retraso y Falta */}
                                        <div className="estudiante-controles">
                                            <button
                                                className="evaluar-btn"
                                                onClick={() =>
                                                    handleEvaluarEstudiante(
                                                        estudiante.ID_EST
                                                    )
                                                }
                                            >
                                                Evaluar
                                            </button>
                                            <label className="checkbox-label">
                                                <input type="checkbox" />
                                                Retraso
                                            </label>
                                            <label className="checkbox-label">
                                                <input type="checkbox" />
                                                Falta
                                            </label>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p>No hay estudiantes en este grupo.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvaluacionGrupoIndividual;
