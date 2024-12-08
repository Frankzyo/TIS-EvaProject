import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEstudiante from "../Components/SidebarEstudiante";
import Header from "../Components/HeaderEstudiante";
import useProjectAndGroupId from "../Components/useProjectAndGroupId";
import axios from "axios";
import "../../css/PlanificacionEstudiante.css";
import "../../css/SidebarEstudiante.css";
import "../../css/EvaluacionDeParesEstudiante.css";

const EvaluacionDeParesEstudiante = () => {
    const navigate = useNavigate();
    const [proyecto, setProyecto] = useState(null);
    const [grupo, setGrupo] = useState(null);
    const { projectId, groupId } = useProjectAndGroupId();
    const [evaluacion, setEvaluacion] = useState(null);
    const [asignaciones, setAsignaciones] = useState([]);
    const [isRepresentanteLegal, setIsRepresentanteLegal] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Obtener datos del estudiante (proyecto y grupo)
    useEffect(() => {
        const obtenerDatosEstudiante = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/estudiante/proyecto-grupo",
                    { withCredentials: true }
                );
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
    // Verificar autenticación del usuario
    useEffect(() => {
        const role = localStorage.getItem("ROLE");
        const estudianteId = localStorage.getItem("ID_EST");
        if (role !== "Estudiante" || !estudianteId) {
            navigate("/login");
        }
    }, [navigate]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    // Cargar evaluación y asignaciones
    useEffect(() => {
        const fetchEvaluacion = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/evaluacion-pares/${projectId}/${groupId}`,
                    { withCredentials: true }
                );
                setEvaluacion(response.data.evaluacion);
                setAsignaciones(response.data.asignaciones);
                console.log("Asignaciones:", response.data.asignaciones); // Verificar en consola
            } catch (err) {
                console.error("Error al cargar los datos:", err);
            }
        };
        fetchEvaluacion();
    }, [projectId, groupId]);

    // Publicar enlace del proyecto
    const handlePublicarLink = async (idAsignacion, linkProyecto) => {
        try {
            await axios.post(
                `http://localhost:8000/api/evaluacion-pares/publicar-link/${idAsignacion}`,
                { link_proyecto: linkProyecto },
                { withCredentials: true }
            );
            alert("Enlace publicado exitosamente.");
        } catch (err) {
            console.error("Error al publicar el enlace:", err);
            alert("No se pudo publicar el enlace.");
        }
    };

    // Guardar comentario y calificación
    const handleGuardarComentarioYNota = async (idAsignacion, comentario, calificacion) => {
        const calificacionNumerica = parseInt(calificacion, 10);
    
        // Validar que la calificación no exceda la nota máxima
        if (calificacionNumerica > evaluacion.nota_maxima) {
            alert(`La calificación no puede exceder la nota máxima (${evaluacion.nota_maxima}).`);
            return;
        }
    
        try {
            const response = await axios.post(
                `http://localhost:8000/api/evaluacion-pares/agregar-comentario/${idAsignacion}`,
                {
                    comentarios: comentario,
                    calificacion: calificacionNumerica,
                },
                { withCredentials: true }
            );
            alert(response.data.message);
    
            // Actualizar las asignaciones en el estado
            setAsignaciones((prevAsignaciones) =>
                prevAsignaciones.map((asignacion) =>
                    asignacion.id_asignacion_par === idAsignacion
                        ? {
                              ...asignacion,
                              comentarios_y_notas: asignacion.comentarios_y_notas.length
                                  ? asignacion.comentarios_y_notas.map((nota) =>
                                        nota.estudiante?.id === parseInt(localStorage.getItem("ID_EST"), 10)
                                            ? {
                                                  ...nota,
                                                  comentarios: comentario,
                                                  calificacion: calificacionNumerica,
                                              }
                                            : nota
                                    )
                                  : [
                                        {
                                            estudiante: {
                                                id: parseInt(localStorage.getItem("ID_EST"), 10),
                                            },
                                            comentarios: comentario,
                                            calificacion: calificacionNumerica,
                                        },
                                    ],
                          }
                        : asignacion
                )
            );
        } catch (err) {
            console.error("Error al guardar comentario y nota:", err);
            alert("No se pudo guardar el comentario y la calificación.");
        }
    };
    
    
    return (
        <div
            className={`evaluacion-pares-estudiante-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <Header />
            <div className="evaluacion-pares-estudiante-sidebar-content">
                <SidebarEstudiante
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={() =>
                        setIsSidebarCollapsed(!isSidebarCollapsed)
                    }
                    nombreProyecto={proyecto?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${proyecto?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                    groupId={groupId}
                    isRepresentanteLegal={isRepresentanteLegal}
                />
                <div className="tareas-estudiante-main-content">
                    <div className="form-pares">
                        {evaluacion ? (
                            <div className="evaluacion-detalles">
                                <div className="evaluacion-info">
                                    <h2 className="evaluacion-pares-title">
                                        {evaluacion.titulo}
                                    </h2>
                                    <p className="descripcion-autoevaluacion">
                                        {evaluacion.descripcion}
                                    </p>
                                    <div className="autoevaluacion-fechas">
                                        <div className="autoevaluacion-fecha-item">
                                            <span className="autoevaluacion-fecha-label">
                                                Fecha de inicio:
                                            </span>
                                            <span className="autoevaluacion-fecha-value">
                                                {evaluacion.fecha_inicio}
                                            </span>
                                        </div>
                                        <div className="autoevaluacion-fecha-item">
                                            <span className="autoevaluacion-fecha-label">
                                                Fecha de fin:
                                            </span>
                                            <span className="autoevaluacion-fecha-value">
                                                {evaluacion.fecha_fin}
                                            </span>
                                        </div>
                                    </div>
                                </div>
    
                                <div className="evaluacion-asignaciones">
                                    <h3>Asignaciones</h3>
                                    {asignaciones.map((asignacion) => (
                                        <div
                                            key={asignacion.id_asignacion_par}
                                            className="asignacion-card"
                                        >
                                            <div className="asignacion-body">
                                                {/* Evaluador */}
                                                <div className="asignacion-section evaluador-section">
                                                    <h4 className="section-title">
                                                        Evaluador
                                                    </h4>
                                                    <img
                                                        src={`http://localhost:8000/storage/${
                                                            asignacion.grupo_evaluador
                                                                ?.PORTADA_GRUPO ||
                                                            "default-image.png"
                                                        }`}
                                                        alt={`Portada del grupo evaluador: ${
                                                            asignacion
                                                                .grupo_evaluador
                                                                ?.NOMBRE_GRUPO ||
                                                            "Sin nombre"
                                                        }`}
                                                        className="grupo-portada"
                                                    />
                                                    <p className="grupo-nombre">
                                                        {asignacion.grupo_evaluador
                                                            ?.NOMBRE_GRUPO ||
                                                            "Nombre no disponible"}
                                                    </p>
                                                </div>
    
                                                {/* Evaluado */}
                                                <div className="asignacion-section evaluado-section">
                                                    <h4 className="section-title">
                                                        Evaluado
                                                    </h4>
                                                    <img
                                                        src={`http://localhost:8000/storage/${
                                                            asignacion.grupo_evaluado
                                                                ?.PORTADA_GRUPO ||
                                                            "default-image.png"
                                                        }`}
                                                        alt={`Portada del grupo evaluado: ${
                                                            asignacion
                                                                .grupo_evaluado
                                                                ?.NOMBRE_GRUPO ||
                                                            "Sin nombre"
                                                        }`}
                                                        className="grupo-portada"
                                                    />
                                                    <p className="grupo-nombre">
                                                        {asignacion.grupo_evaluado
                                                            ?.NOMBRE_GRUPO ||
                                                            "Nombre no disponible"}
                                                    </p>
                                                </div>
                                            </div>
    
                                            <div className="asignacion-actions">
                                                {/* Publicar Link */}
                                                {/* Publicar o Mostrar Enlace del Proyecto */}
                                                {String(asignacion.id_grupo_evaluado) === String(groupId) && (
    <form
        onSubmit={(e) => {
            e.preventDefault();
            handlePublicarLink(
                asignacion.id_asignacion_par,
                e.target.linkProyecto.value
            );
        }}
        className="publicar-link-form"
    >
        <div className="form-group">
            <label
                htmlFor={`linkProyecto-${asignacion.id_asignacion_par}`}
                className="form-label"
            >
                Enlace del Proyecto
            </label>
            <input
                type="url"
                id={`linkProyecto-${asignacion.id_asignacion_par}`}
                name="linkProyecto"
                placeholder="Ingrese o edite el enlace de su proyecto"
                className="form-input"
                defaultValue={asignacion.link_proyecto || ""}
                required
            />
        </div>
        <button type="submit" className="form-submit-btn">
            {asignacion.link_proyecto ? "Actualizar Enlace" : "Publicar Enlace"}
        </button>
    </form>
)}

    
                                                {/* Mostrar Link */}
                                                {String(
                                                    asignacion.id_grupo_evaluador
                                                ) === String(groupId) && (
                                                    <div className="link-publicado">
                                                        {asignacion.link_proyecto ? (
                                                            <>
                                                                <p>
                                                                    <strong>
                                                                        Enlace del
                                                                        Grupo
                                                                        Evaluado:
                                                                    </strong>
                                                                </p>
                                                                <a
                                                                    href={
                                                                        asignacion.link_proyecto
                                                                    }
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    {
                                                                        asignacion.link_proyecto
                                                                    }
                                                                </a>
                                                            </>
                                                        ) : (
                                                            <p className="no-link-aviso">
                                                                <strong>
                                                                    El grupo
                                                                    evaluado aún no
                                                                    ha publicado un
                                                                    enlace.
                                                                </strong>
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
    
                                                {/* Guardar Comentarios y Notas */}
                                                {String(asignacion.id_grupo_evaluador) === String(groupId) ? (
    <form
        onSubmit={(e) => {
            e.preventDefault();
            handleGuardarComentarioYNota(
                asignacion.id_asignacion_par,
                e.target.comentario.value,
                e.target.calificacion.value
            );
        }}
        className="guardar-comentario-form"
    >
        <div className="form-group">
            <label
                className="form-label"
                htmlFor={`comentario-${asignacion.id_asignacion_par}`}
            >
                Comentario:
            </label>
            <textarea
                id={`comentario-${asignacion.id_asignacion_par}`}
                name="comentario"
                placeholder="Escribe tu comentario"
                className="form-textarea"
                defaultValue={
                    asignacion.comentarios_y_notas?.find(
                        (comentarioNota) =>
                            comentarioNota.estudiante?.id ===
                            parseInt(localStorage.getItem("ID_EST"), 10)
                    )?.comentarios || ""
                }
                required
            ></textarea>
        </div>
        <div className="form-group">
            <label
                className="form-label"
                htmlFor={`calificacion-${asignacion.id_asignacion_par}`}
            >
                Nota:
            </label>
            <input
                id={`calificacion-${asignacion.id_asignacion_par}`}
                type="number"
                name="calificacion"
                placeholder="Agrega tu nota"
                className="form-input-number"
                min="1"
                max={evaluacion.nota_maxima}
                defaultValue={
                    asignacion.comentarios_y_notas?.find(
                        (comentarioNota) =>
                            comentarioNota.estudiante?.id ===
                            parseInt(localStorage.getItem("ID_EST"), 10)
                    )?.calificacion || ""
                }
                required
            />
        </div>
        <div className="form-actions">
            <button type="submit" className="form-submit-btn">
                {asignacion.comentarios_y_notas?.find(
                    (comentarioNota) =>
                        comentarioNota.estudiante?.id ===
                        parseInt(localStorage.getItem("ID_EST"), 10)
                )
                    ? "Actualizar"
                    : "Guardar"}
            </button>
        </div>
    </form>
) : null}

{/* Mostrar comentarios y calificaciones */}
<div className="comentarios-section">
    <h4>Comentarios Recibidos:</h4>
    {String(asignacion.id_grupo_evaluado) === String(groupId) ? (
        asignacion.comentarios_y_notas?.length > 0 ? (
            asignacion.comentarios_y_notas.map((comentarioNota, index) => (
                <div key={index} className="comentario-item mejorado">
                    <div className="comentario-header">
                        {/* Foto del estudiante */}
                        <img
                            src={`http://localhost:8000/storage/${comentarioNota.estudiante?.foto || "default-profile.png"}`}
                            alt={`Foto del estudiante: ${comentarioNota.estudiante?.nombre || "Anónimo"}`}
                            className="estudiante-foto mejorado"
                        />
                        <div className="estudiante-info">
                            <p className="estudiante-nombre mejorado">
                                {comentarioNota.estudiante
                                    ? `${comentarioNota.estudiante.nombre} ${comentarioNota.estudiante.apellido}`
                                    : "Anónimo"}
                            </p>
                        </div>
                    </div>
                    <div className="comentario-body mejorado">
                        <p>
                            <strong>Comentario:</strong> {comentarioNota.comentarios || "No disponible"}
                        </p>
                    </div>
                </div>
            ))
        ) : (
            <p className="no-comentarios-message">
                <strong>Aún no hay comentarios.</strong>
            </p>
        )
    ) : String(asignacion.id_grupo_evaluador) === String(groupId) ? (
        // Grupo Evaluador: Ver comentarios y notas puestos por sus estudiantes
        asignacion.comentarios_y_notas?.length > 0 ? (
            asignacion.comentarios_y_notas.map((comentarioNota, index) => (
                <div key={index} className="comentario-item mejorado">
                    <div className="comentario-header">
                        <img
                            src={`http://localhost:8000/storage/${comentarioNota.estudiante?.foto || "default-profile.png"}`}
                            alt={`Foto del estudiante: ${comentarioNota.estudiante?.nombre || "Anónimo"}`}
                            className="estudiante-foto mejorado"
                        />
                        <div className="estudiante-info">
                            <span className="estudiante-nombre mejorado">
                                {comentarioNota.estudiante
                                    ? `${comentarioNota.estudiante.nombre} ${comentarioNota.estudiante.apellido}`
                                    : "Anónimo"}
                            </span>
                        </div>
                    </div>
                    <div className="comentario-body mejorado">
                        <p>
                            <strong>Comentario:</strong> {comentarioNota.comentarios || "No disponible"}
                        </p>
                        <p>
                            <strong>Calificación:</strong> {comentarioNota.calificacion || "No disponible"}
                        </p>
                    </div>
                </div>
            ))
        ) : (
            <p className="no-comentarios-message">
                <strong>Aún no hay comentarios ni calificaciones.</strong>
            </p>
        )
    ) : (
        // Ningún rol válido
        <p className="no-comentarios-message">
            <strong>No tienes acceso a esta información.</strong>
        </p>
    )}
</div>


                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="no-evaluacion-message">
                                No se encontró información de la evaluación.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
    
};

export default EvaluacionDeParesEstudiante;
