import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEstudiante from "../../Components/ComponenteSidebar/SidebarEstudiante";
import Header from "../../Components/ComponenteHeader/HeaderEstudiante";
import useProjectAndGroupId from "../../Components/ComponenteId/useProjectAndGroupId";
import axios from "axios";
import "../../../css/EstilosPlanificacion/PlanificacionEstudiante.css";
import "../../../css/EstilosEvaluaciones/AutoevaluacionEstudiante.css";
import "../../../css/EstilosSidebar/SidebarEstudiante.css";

const AutoevaluacionEstudiante = () => {
    const navigate = useNavigate();
    const [proyecto, setProyecto] = useState(null);
    const [grupo, setGrupo] = useState(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { projectId, groupId } = useProjectAndGroupId();
    const [isRepresentanteLegal, setIsRepresentanteLegal] = useState(false);
    const [autoevaluacion, setAutoevaluacion] = useState(null);
    const [resultado, setResultado] = useState(null);
    const [respuestas, setRespuestas] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [puntuacionPromedio, setPuntuacionPromedio] = useState(null);

    useEffect(() => {
        const role = localStorage.getItem("ROLE");
        const estudianteId = localStorage.getItem("ID_EST");
        const representanteLegal = localStorage.getItem("IS_RL");

        if (role !== "Estudiante" || !estudianteId) {
            navigate("/login");
        }

        setIsRepresentanteLegal(representanteLegal === "true");
    }, [navigate]);

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
                    fetchAutoevaluacion(response.data.proyecto.ID_PROYECTO);
                    fetchResultado(
                        response.data.proyecto.ID_PROYECTO,
                        response.data.grupo.ID_GRUPO
                    );
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

    const fetchAutoevaluacion = async (projectId) => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/proyectos/${projectId}/autoevaluaciones`,
                { withCredentials: true }
            );
            setAutoevaluacion(response.data[0]);
        } catch (error) {
            console.error("Error al cargar la autoevaluación:", error);
        }
    };

    const fetchResultado = async (projectId, groupId) => {
        try {
            const response = await axios.get(
                `http://localhost:8000/autoevaluaciones/resultados`,
                {
                    params: {
                        ID_PROYECTO: projectId,
                        ID_GRUPO: groupId,
                        ID_EST: localStorage.getItem("ID_EST"),
                    },
                    withCredentials: true,
                }
            );
            if (response.data.length > 0) {
                setResultado(response.data[0]); // Indica que ya hay un resultado guardado.
            }
        } catch (error) {
            console.error(
                "Error al cargar el resultado de autoevaluación:",
                error.response?.data || error.message
            );
        }
    };

    const calcularPromedio = () => {
        const maxPuntuacion = autoevaluacion.preguntas.reduce(
            (sum, pregunta) =>
                sum +
                Math.max(
                    ...pregunta.opciones.map(
                        (opcion) => opcion.PUNTUACION_OPCION_AUTOEVAL
                    )
                ),
            0
        );

        const totalPuntos = Object.values(respuestas).reduce(
            (sum, respuestaId) => {
                const opcion = autoevaluacion.preguntas
                    .flatMap((pregunta) => pregunta.opciones)
                    .find(
                        (opcion) => opcion.ID_OPCION_AUTOEVAL === respuestaId
                    );
                return sum + (opcion ? opcion.PUNTUACION_OPCION_AUTOEVAL : 0);
            },
            0
        );

        return (
            (totalPuntos / maxPuntuacion) *
            autoevaluacion.PUNTUACION_TOTAL_AUTOEVAL
        ).toFixed(2);
    };

    const handleResponseChange = (preguntaId, opcionId) => {
        setRespuestas((prev) => ({
            ...prev,
            [preguntaId]: opcionId,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (resultado) {
            setErrorMessage("Ya has completado esta autoevaluación.");
            return;
        }

        const today = new Date();
        const fechaInicio = new Date(autoevaluacion.FECHA_INICIO_AUTOEVAL);
        const fechaFin = new Date(autoevaluacion.FECHA_FIN_AUTOEVAL);

        if (today < fechaInicio || today > fechaFin) {
            setErrorMessage(
                "La autoevaluación no está activa en este momento."
            );
            return;
        }

        const promedio = calcularPromedio();
        setPuntuacionPromedio(promedio);

        // Construir el array de respuestas marcadas
        const respuestasMarcadas = Object.keys(respuestas).map(
            (preguntaId) => ({
                ID_PREGUNTA_AUTOEVAL: parseInt(preguntaId, 10),
                ID_OPCION_AUTOEVAL: respuestas[preguntaId],
            })
        );

        // Agregar consola para ver qué datos estamos enviando al backend
        console.log("Respuestas enviadas al backend:", respuestasMarcadas);

        try {
            const payload = {
                ID_AUTOEVAL_PROYECTO: autoevaluacion.ID_AUTOEVAL_PROYECTO,
                ID_GRUPO: grupo.ID_GRUPO,
                ID_EST: localStorage.getItem("ID_EST"),
                NOMBRE_AUTOEVAL: autoevaluacion.TITULO_AUTOEVAL,
                PUNTUACION_MAXIMA_AUTOEVAL:
                    autoevaluacion.PUNTUACION_TOTAL_AUTOEVAL,
                PUNTUACION_OBTENIDA: promedio,
                FECHA_INICIO: autoevaluacion.FECHA_INICIO_AUTOEVAL,
                RESPUESTAS: respuestasMarcadas, // Enviar las respuestas
            };

            // Agregar consola antes de enviar la solicitud POST
            console.log("Enviando al backend:", payload);

            await axios.post(
                `http://localhost:8000/autoevaluaciones/resultados`,
                payload,
                { withCredentials: true }
            );

            setSuccessMessage("Respuestas guardadas exitosamente.");
            fetchResultado(projectId, groupId); // Actualizar el estado del resultado.
        } catch (error) {
            setErrorMessage("Hubo un error al guardar los resultados.");
        }
    };

    return (
        <div
            className={`autoevaluacion-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <Header />
            <div className="autoevaluacion-sidebar-content">
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
                <div className="autoevaluacion-main-contain">
                    <div className="form">
                        <h1 className="autoevaluacion-title">
                            {autoevaluacion?.TITULO_AUTOEVAL ||
                                "Autoevaluación"}
                        </h1>
                        <p className="descripcion-autoevaluacion">
                            {autoevaluacion?.DESCRIPCION_AUTOEVAL}
                        </p>
                        <div className="autoevaluacion-fechas">
                            <div className="autoevaluacion-fecha-item">
                                <span className="autoevaluacion-fecha-label">
                                    Fecha de inicio:
                                </span>
                                <span className="autoevaluacion-fecha-value">
                                    {formatFechaLarga(
                                        autoevaluacion?.FECHA_INICIO_AUTOEVAL
                                    )}
                                </span>
                            </div>
                            <div className="autoevaluacion-fecha-item">
                                <span className="autoevaluacion-fecha-label">
                                    Fecha de fin:
                                </span>
                                <span className="autoevaluacion-fecha-value">
                                    {formatFechaLarga(
                                        autoevaluacion?.FECHA_FIN_AUTOEVAL
                                    )}
                                </span>
                            </div>
                        </div>
                        {resultado ? (
                            <div className="autoevaluacion-resultado">
                                <h2>Autoevaluación Completada</h2>
                                <p>
                                    <strong>Tu puntuación promedio es:</strong>{" "}
                                    {resultado.PUNTUACION_OBTENIDA}
                                </p>
                                <p>
                                    Gracias por completar tu autoevaluación.
                                    Utiliza estos resultados para reflexionar
                                    sobre tus fortalezas y áreas de mejora.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {autoevaluacion?.preguntas?.length > 0 ? (
                                    autoevaluacion.preguntas.map((pregunta) => (
                                        <div
                                            key={pregunta.ID_PREGUNTA_AUTOEVAL}
                                            className="autoevaluacion-item"
                                        >
                                            <h4 className="pregunta-title">
                                                {pregunta.PREGUNTA_AUTOEVAL}
                                            </h4>
                                            <div className="opciones-container">
                                                {pregunta.opciones.map(
                                                    (opcion) => (
                                                        <div
                                                            key={
                                                                opcion.ID_OPCION_AUTOEVAL
                                                            }
                                                            className="opcion-col"
                                                        >
                                                            <span className="opcion-titulo">
                                                                {
                                                                    opcion.TEXTO_OPCION_AUTOEVAL
                                                                }
                                                            </span>
                                                            <label className="opcion-radio">
                                                                <input
                                                                    type="radio"
                                                                    name={`pregunta-${pregunta.ID_PREGUNTA_AUTOEVAL}`}
                                                                    value={
                                                                        opcion.ID_OPCION_AUTOEVAL
                                                                    }
                                                                    onChange={() =>
                                                                        handleResponseChange(
                                                                            pregunta.ID_PREGUNTA_AUTOEVAL,
                                                                            opcion.ID_OPCION_AUTOEVAL
                                                                        )
                                                                    }
                                                                    checked={
                                                                        respuestas[
                                                                            pregunta
                                                                                .ID_PREGUNTA_AUTOEVAL
                                                                        ] ===
                                                                        opcion.ID_OPCION_AUTOEVAL
                                                                    }
                                                                />
                                                            </label>
                                                            <span className="opcion-puntos">
                                                                {
                                                                    opcion.PUNTUACION_OPCION_AUTOEVAL
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay autoevaluaciones disponibles.</p>
                                )}
                                <div className="form-footer">
                                    <button
                                        type="submit"
                                        className="save-button"
                                        disabled={
                                            Object.keys(respuestas).length !==
                                            autoevaluacion?.preguntas?.length
                                        }
                                    >
                                        Guardar Respuestas
                                    </button>
                                </div>
                            </form>
                        )}

                        {successMessage && (
                            <p className="success-messages">{successMessage}</p>
                        )}
                        {errorMessage && (
                            <p className="error-messages">{errorMessage}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutoevaluacionEstudiante;
