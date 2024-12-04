import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import SidebarPrueba from "../../Components/ComponenteSidebar/SidebarPrueba";
import "../../../css/EstilosHeader/HeaderProyecto.css";
import "../../../css/EstilosSidebar/SidebarPrueba.css";
import "../../../css/EstilosEvaluaciones/EvaluacionDePares.css";
import axios from "axios";
import ModalNuevaEvaluacion from "../../Components/ComponentsEvaluacionDePares/ModalNuevaEvaluacion";

const EvaluacionDePares = () => {
    const { projectId } = useParams();

    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const [projectResponse, gruposResponse, evaluacionesResponse] =
                    await Promise.all([
                        axios.get(
                            `http://localhost:8000/api/proyectos/${projectId}`,
                            { withCredentials: true }
                        ),
                        axios.get(
                            `http://localhost:8000/api/proyectos/${projectId}/grupos-fechas`,
                            { withCredentials: true }
                        ),
                        axios.get(
                            `http://localhost:8000/api/evaluaciones-pares/proyecto/${projectId}`,
                            { withCredentials: true }
                        ),
                    ]);

                setProjectDetails(projectResponse.data);
                setGrupos(gruposResponse.data.grupos || []);
                setEvaluaciones(
                    Array.isArray(evaluacionesResponse.data.evaluaciones)
                        ? evaluacionesResponse.data.evaluaciones
                        : []
                );
            } catch (err) {
                if (err.response) {
                    console.error("Error del servidor:", err.response.data);
                    setError(
                        err.response.data.message ||
                            "Error desconocido en el servidor"
                    );
                } else {
                    console.error("Error de red:", err);
                    setError("Error de red. Por favor, verifica tu conexión.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (projectId) fetchData();
    }, [projectId]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const handleRegistrarEvaluacion = async (datosEvaluacion) => {
        try {
            const response = await axios.post(
                `http://localhost:8000/api/evaluaciones-pares`,
                {
                    ...datosEvaluacion,
                    grupos: grupos.map((grupo) => grupo.ID_GRUPO),
                    id_proyecto: projectId,
                },
                { withCredentials: true }
            );

            setEvaluaciones((prev) => [...prev, response.data.evaluacion]);
            setShowModal(false);
        } catch (err) {
            if (err.response && err.response.data.errors) {
                alert(
                    "Error al registrar la evaluación: " +
                        JSON.stringify(err.response.data.errors, null, 2)
                );
            } else {
                console.error(
                    "Error inesperado al registrar la evaluación:",
                    err
                );
            }
        }
    };

    if (isLoading) {
        return <p>Cargando datos...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div
            className={`evaluacion-pares-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderProyecto />
            <div className="evaluacion-pares-sidebar-content">
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                />
                <div className="container">
                    <div className="projects-header">
                        <h2>Evaluaciones de Pares</h2>
                        <button
                            className="new-project-btn"
                            onClick={() => setShowModal(true)}
                        >
                            <i className="fas fa-plus"></i> Nueva Evaluación
                        </button>
                    </div>

                    <div className="evaluaciones-list">
                        {Array.isArray(evaluaciones) &&
                        evaluaciones.length > 0 ? (
                            evaluaciones.map((evaluacion, index) => (
                                <div
                                    key={index}
                                    className="card evaluacion-card"
                                >
                                    <h3>
                                        Evaluación #{index + 1}{" "}
                                        <small>
                                            (ID: {evaluacion.id_evaluacion_par})
                                        </small>
                                    </h3>
                                    <p>
                                        <strong>Fecha:</strong>{" "}
                                        {evaluacion.fecha_inicio ||
                                            "No especificada"}{" "}
                                        -{" "}
                                        {evaluacion.fecha_fin ||
                                            "No especificada"}
                                    </p>
                                    <p>
                                        <strong>Nota Máxima:</strong>{" "}
                                        {evaluacion.nota_maxima ||
                                            "No especificada"}
                                    </p>
                                    <div>
                                        <p>
                                            <strong>
                                                Relación de Evaluadores y
                                                Evaluados:
                                            </strong>
                                        </p>
                                        <ul>
                                            {evaluacion.grupos_evaluadores?.map(
                                                (grupoEvaluador, i) => {
                                                    const grupoEvaluado =
                                                        evaluacion.grupos_evaluados.find(
                                                            (g) =>
                                                                g.id_asignacion_par ===
                                                                grupoEvaluador.id_asignacion_par
                                                        );

                                                    return (
                                                        <li key={i}>
                                                            <p>
                                                                <strong>
                                                                    Evaluador:
                                                                </strong>{" "}
                                                                {grupoEvaluador
                                                                    .grupo_evaluador
                                                                    ?.NOMBRE_GRUPO ||
                                                                    "Grupo sin nombre"}{" "}
                                                                (ID:{" "}
                                                                {grupoEvaluador
                                                                    .grupo_evaluador
                                                                    ?.ID_GRUPO ||
                                                                    "N/A"}
                                                                )
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    Evaluado:
                                                                </strong>{" "}
                                                                {grupoEvaluado
                                                                    ?.grupo_evaluado
                                                                    ?.NOMBRE_GRUPO ||
                                                                    "Grupo sin nombre"}{" "}
                                                                (ID:{" "}
                                                                {grupoEvaluado
                                                                    ?.grupo_evaluado
                                                                    ?.ID_GRUPO ||
                                                                    "N/A"}
                                                                )
                                                            </p>
                                                        </li>
                                                    );
                                                }
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data-message">
                                {" "}
                                No hay evaluaciones registradas
                            </p>
                        )}
                    </div>

                    {!Array.isArray(grupos) || grupos.length === 0 ? (
                        <p className="no-data-message">
                            No hay grupos disponibles para la evaluación.
                        </p>
                    ) : null}
                </div>
            </div>

            {showModal && (
                <ModalNuevaEvaluacion
                    onClose={() => setShowModal(false)}
                    onRegistrarEvaluacion={handleRegistrarEvaluacion}
                />
            )}
        </div>
    );
};

export default EvaluacionDePares;
