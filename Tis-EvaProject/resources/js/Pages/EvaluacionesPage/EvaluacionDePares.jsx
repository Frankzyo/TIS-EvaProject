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
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
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

                // Añadir lógica para obtener representantes legales
                const gruposConRepresentantes = await Promise.all(
                    gruposResponse.data.grupos.map(async (grupo) => {
                        try {
                            const representante = await axios.get(
                                `http://localhost:8000/api/estudiantes/${grupo.CREADO_POR}`,
                                { withCredentials: true }
                            );
                            return {
                                ...grupo,
                                representanteLegal: representante.data,
                            };
                        } catch {
                            return { ...grupo, representanteLegal: null };
                        }
                    })
                );

                setProjectDetails(projectResponse.data);
                setGrupos(gruposConRepresentantes || []);
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
            }
        };

        if (projectId) fetchData();
    }, [projectId]);

    const formatFechaLarga = (fechaString) => {
        const opciones = {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "America/La_Paz",
        };

        const fecha = new Date(`${fechaString}T00:00:00-04:00`);
        return fecha.toLocaleDateString("es-ES", opciones);
    };

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
                        <h2>Configuracion de Evaluaciones de Pares</h2>
                        <button
                            className="new-project-btn"
                            onClick={() => setShowModal(true)}
                        >
                            <i className="fas fa-plus"></i> Nueva Evaluación
                        </button>
                    </div>

                    <div className="evaluaciones-list">
                        {evaluaciones?.length > 0 ? (
                            evaluaciones.map((evaluacion, index) => (
                                <div
                                    key={index}
                                    className="card evaluacion-card"
                                >
                                    <h3 className="evaluacion-titulo">
                                        {evaluacion.titulo || "Sin Título"}
                                    </h3>
                                    <p className="evaluacion-descripcion">
                                        {evaluacion.descripcion ||
                                            "Sin Descripción"}
                                    </p>
                                    <div className="fecha-container">
                                        <p className="fecha">
                                            <span className="fecha-label">
                                                Fecha de Inicio:
                                            </span>{" "}
                                            <span className="fecha-valor">
                                                {evaluacion.fecha_inicio
                                                    ? formatFechaLarga(
                                                          evaluacion.fecha_inicio
                                                      )
                                                    : "N/A"}
                                            </span>
                                        </p>
                                        <p className="fecha">
                                            <span className="fecha-label">
                                                Fecha de Fin:
                                            </span>{" "}
                                            <span className="fecha-valor">
                                                {evaluacion.fecha_fin
                                                    ? formatFechaLarga(
                                                          evaluacion.fecha_fin
                                                      )
                                                    : "N/A"}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="nota-maxima-container">
                                        <p className="nota-maxima">
                                            <span className="nota-label">
                                                Nota Máxima:
                                            </span>{" "}
                                            <span className="nota-valor">
                                                {evaluacion.nota_maxima ||
                                                    "N/A"}
                                            </span>
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="configuracion-grupos-titulo">
                                            Evaluadores y Evaluados
                                        </h3>
                                        <div className="evaluadores-container">
                                            {evaluacion.grupos_evaluadores?.map(
                                                (grupoEvaluador, i) => {
                                                    const grupoEvaluado =
                                                        evaluacion.grupos_evaluados.find(
                                                            (g) =>
                                                                g.id_asignacion_par ===
                                                                grupoEvaluador.id_asignacion_par
                                                        );

                                                    return (
                                                        <div
                                                            key={i}
                                                            className="grupo-pair"
                                                        >
                                                            <div className="grupo-info">
                                                                <img
                                                                    src={`http://localhost:8000/storage/${
                                                                        grupoEvaluador
                                                                            .grupo_evaluador
                                                                            ?.PORTADA_GRUPO ||
                                                                        "default-image.jpg"
                                                                    }`}
                                                                    alt="Evaluador"
                                                                    className="grupo-foto"
                                                                />
                                                                <p>
                                                                    <strong>
                                                                        Evaluador:
                                                                    </strong>{" "}
                                                                    {grupoEvaluador
                                                                        .grupo_evaluador
                                                                        ?.NOMBRE_GRUPO ||
                                                                        "N/A"}
                                                                </p>

                                                                <img
                                                                    src={`http://localhost:8000/storage/${
                                                                        grupoEvaluado
                                                                            ?.grupo_evaluado
                                                                            ?.PORTADA_GRUPO ||
                                                                        "default-image.jpg"
                                                                    }`}
                                                                    alt="Evaluado"
                                                                    className="grupo-foto"
                                                                />
                                                                <p>
                                                                    <strong>
                                                                        Evaluado:
                                                                    </strong>{" "}
                                                                    {grupoEvaluado
                                                                        ?.grupo_evaluado
                                                                        ?.NOMBRE_GRUPO ||
                                                                        "N/A"}
                                                                </p>
                                                            </div>
                                                            <div className="details-button-container">
                                                                <button
                                                                    className="details-button"
                                                                    onClick={() =>
                                                                        handleViewGroupDetails(
                                                                            grupoEvaluador
                                                                                .grupo_evaluador
                                                                                ?.ID_GRUPO,
                                                                            grupoEvaluado
                                                                                ?.grupo_evaluado
                                                                                ?.ID_GRUPO
                                                                        )
                                                                    }
                                                                >
                                                                    Ver detalles
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data-message">
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
