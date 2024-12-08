import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SidebarEstudiante from "../Components/SidebarEstudiante";
import Header from "../Components/HeaderEstudiante";
import useProjectAndGroupId from "../Components/useProjectAndGroupId";
import axios from "axios";
import "../../css/PlanificacionEstudiante.css";
import "../../css/SidebarEstudiante.css";
import "../../css/TareasEstudiante.css";

const EvaluacionDeParesEstudiante = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Obtener el ID de la evaluación desde la URL
    const { projectId, groupId } = useProjectAndGroupId();
    const [proyecto, setProyecto] = useState(null);
    const [evaluacion, setEvaluacion] = useState(null); // Evaluación específica
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isRepresentanteLegal, setIsRepresentanteLegal] = useState(false);
    const [error, setError] = useState(null); // Manejo de errores

    // Verificar usuario
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

    // Cargar evaluación
    useEffect(() => {
        const fetchEvaluacion = async () => {
            setError(null);
            console.log(`Obteniendo evaluación con ID: ${id}`);
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/evaluaciones-pares/${id}`,
                    { withCredentials: true }
                );
                console.log("Evaluación obtenida:", response.data.evaluacion);
                setEvaluacion(response.data.evaluacion);
            } catch (err) {
                console.error("Error al cargar la evaluación:", err);
                setError("No se pudo cargar la evaluación. Intente nuevamente.");
            }
        };

        if (id) fetchEvaluacion();
    }, [id]);

    const handlePublicarLink = async (idAsignacion, linkProyecto) => {
        try {
            await axios.post(
                `http://localhost:8000/api/evaluaciones-pares/publicar-link/${idAsignacion}`,
                { link_proyecto: linkProyecto },
                { withCredentials: true }
            );
            alert("Enlace publicado exitosamente");
        } catch (err) {
            console.error("Error al publicar el enlace:", err);
            alert("Error al publicar el enlace.");
        }
    };

    const handleGuardarComentarioYNota = async (idAsignacion, comentario, calificacion) => {
        try {
            await axios.post(
                `http://localhost:8000/api/evaluaciones-pares/agregar-comentario/${idAsignacion}`,
                { comentarios: comentario, calificacion: parseInt(calificacion, 10) },
                { withCredentials: true }
            );
            alert("Comentario y calificación guardados exitosamente.");
        } catch (err) {
            console.error("Error al guardar comentario y nota:", err);
            alert("Error al guardar comentario y nota.");
        }
    };

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
                    nombreProyecto={proyecto?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${proyecto?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                    groupId={groupId}
                    isRepresentanteLegal={isRepresentanteLegal}
                />
                <div className="tareas-estudiante-main-content">
                    <h1 className="tareas-estudiante-title">Evaluación de Pares</h1>
                    {error ? (
                        <p className="error-message">{error}</p>
                    ) : evaluacion ? (
                        <div className="evaluacion-card">
                            <h3>Detalles de la Evaluación</h3>
                            <p>
                                <strong>Evaluador:</strong>{" "}
                                {evaluacion.grupoEvaluador?.NOMBRE_GRUPO || "N/A"}
                            </p>
                            <p>
                                <strong>Evaluado:</strong>{" "}
                                {evaluacion.grupoEvaluado?.NOMBRE_GRUPO || "N/A"}
                            </p>

                            {/* Publicar Link del Proyecto */}
                            {isRepresentanteLegal &&
                                evaluacion.grupoEvaluado?.ID_GRUPO === groupId && (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handlePublicarLink(
                                                evaluacion.id_asignacion_par,
                                                e.target.linkProyecto.value
                                            );
                                        }}
                                    >
                                        <input
                                            type="url"
                                            name="linkProyecto"
                                            placeholder="Enlace del proyecto"
                                            required
                                        />
                                        <button type="submit">Publicar Enlace</button>
                                    </form>
                                )}

                            {/* Comentario y Nota */}
                            {evaluacion.grupoEvaluador?.ID_GRUPO === groupId && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleGuardarComentarioYNota(
                                            evaluacion.id_asignacion_par,
                                            e.target.comentario.value,
                                            e.target.calificacion.value
                                        );
                                    }}
                                >
                                    <textarea
                                        name="comentario"
                                        placeholder="Escribe tu comentario"
                                        required
                                    ></textarea>
                                    <input
                                        type="number"
                                        name="calificacion"
                                        min="1"
                                        max="10"
                                        placeholder="Nota"
                                        required
                                    />
                                    <button type="submit">Guardar</button>
                                </form>
                            )}
                        </div>
                    ) : (
                        <p>No se encontraron detalles para esta evaluación.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvaluacionDeParesEstudiante;
