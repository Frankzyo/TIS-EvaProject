import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEstudiante from "../../Components/ComponenteSidebar/SidebarEstudiante";
import Header from "../../Components/ComponenteHeader/HeaderEstudiante";
import useProjectAndGroupId from "../../Components/ComponenteId/useProjectAndGroupId";
import axios from "axios";
import "../../../css/EstilosPlanificacion/PlanificacionEstudiante.css";
import "../../../css/EstilosSidebar/SidebarEstudiante.css";
import "../../../css/EstilosEvaluaciones/AutoevaluacionEstudiante.css";

const EvaluacionCruzadaEstudiante = () => {
    const navigate = useNavigate();
    const [proyecto, setProyecto] = useState(null);
    const [grupo, setGrupo] = useState(null);
    const [evaluacionCruzada, setEvaluacionCruzada] = useState(null);
    const [estudiantes, setEstudiantes] = useState([]);
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
    const [isRepresentanteLegal, setIsRepresentanteLegal] = useState(false);
    const [respuestas, setRespuestas] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { projectId, groupId } = useProjectAndGroupId();
    const [resultado, setResultado] = useState(null);
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
                    fetchEvaluacionCruzada(response.data.proyecto.ID_PROYECTO);
                    fetchEstudiantes(response.data.grupo.ID_GRUPO);
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

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timeout = setTimeout(() => {
                setSuccessMessage("");
                setErrorMessage("");
            }, 5000); // 5 segundos

            return () => clearTimeout(timeout); // Limpia el timeout si el componente se desmonta
        }
    }, [successMessage, errorMessage]);
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
    const fetchEvaluacionCruzada = async (projectId) => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/proyectos/${projectId}/evaluacion-cruzada`,
                { withCredentials: true }
            );
            setEvaluacionCruzada(response.data?.data[0]);
        } catch (error) {
            console.error("Error al cargar la evaluación cruzada:", error);
        }
    };
    useEffect(() => {
        const fetchEvaluacionIndividual = async () => {
            if (!evaluacionCruzada?.ID_EVAL_CRUZADA || !estudianteSeleccionado)
                return;

            console.log({
                ID_EVAL_CRUZADA: evaluacionCruzada.ID_EVAL_CRUZADA,
                ID_ESTUDIANTE: estudianteSeleccionado,
                ID_EVALUADOR: localStorage.getItem("ID_EST"),
            });

            try {
                const response = await axios.get(
                    `http://localhost:8000/api/evaluacion-cruzada/${evaluacionCruzada.ID_EVAL_CRUZADA}/evaluacion/${estudianteSeleccionado}`,
                    {
                        params: {
                            ID_EVALUADOR: localStorage.getItem("ID_EST"),
                        },
                        withCredentials: true,
                    }
                );

                if (response.data?.data) {
                    setResultado(response.data.data); // Nota asignada por el evaluador actual
                } else {
                    setResultado(null); // No hay evaluación registrada por este evaluador
                }
            } catch (error) {
                console.error(
                    "Error al obtener la evaluación individual:",
                    error
                );
                setResultado(null);
            }
        };

        fetchEvaluacionIndividual();
    }, [evaluacionCruzada, estudianteSeleccionado]);

    const fetchEstudiantes = async (groupId) => {
        try {
            const estudianteId = localStorage.getItem("ID_EST");
            const response = await axios.get(
                `http://localhost:8000/api/estudiantes/grupo/${groupId}`
            );
            const estudiantesFiltrados = response.data.filter(
                (estudiante) => estudiante.ID_EST !== parseInt(estudianteId)
            );
            setEstudiantes(estudiantesFiltrados);
        } catch (error) {
            console.error("Error al cargar los estudiantes:", error);
        }
    };

    const calcularPromedio = () => {
        // Paso 1: Suma de las puntuaciones máximas de cada pregunta
        const maxPuntuacion = evaluacionCruzada.preguntas.reduce(
            (sum, pregunta) =>
                sum +
                pregunta.opciones.reduce(
                    (max, opcion) =>
                        opcion.PUNTUACION_OPCION_EVAL > max
                            ? opcion.PUNTUACION_OPCION_EVAL
                            : max,
                    0
                ),
            0
        );

        // Paso 2: Suma de las puntuaciones de las respuestas seleccionadas
        const totalPuntos = Object.entries(respuestas).reduce(
            (sum, [preguntaId, respuestaId]) => {
                const pregunta = evaluacionCruzada.preguntas.find(
                    (p) => p.ID_PREGUNTA_EVAL === parseInt(preguntaId)
                );
                if (!pregunta) return sum;

                const opcionSeleccionada = pregunta.opciones.find(
                    (opcion) => opcion.ID_OPCION_EVAL === respuestaId
                );
                return (
                    sum +
                    (opcionSeleccionada
                        ? opcionSeleccionada.PUNTUACION_OPCION_EVAL
                        : 0)
                );
            },
            0
        );

        // Paso 3: Normalización de la puntuación
        return (
            (totalPuntos / maxPuntuacion) *
            evaluacionCruzada.PUNTUACION_TOTAL_EVAL
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

        if (!evaluacionCruzada || !estudianteSeleccionado) {
            setErrorMessage("Por favor, selecciona un estudiante a evaluar.");
            return;
        }

        const promedio = calcularPromedio();
        const respuestasMarcadas = Object.keys(respuestas).map(
            (preguntaId) => ({
                ID_PREGUNTA_EVAL: parseInt(preguntaId, 10),
                ID_OPCION_EVAL: respuestas[preguntaId],
            })
        );

        try {
            const payload = {
                ID_EVAL_CRUZADA: evaluacionCruzada.ID_EVAL_CRUZADA,
                ID_EST_EVALUADO: estudianteSeleccionado,
                ID_EST_EVALUADOR: localStorage.getItem("ID_EST"),
                PUNTUACION_OBTENIDA: promedio,
                RESPUESTAS: respuestasMarcadas,
            };

            await axios.post(
                `http://localhost:8000/api/evaluacion-cruzada/resultados`,
                payload,
                { withCredentials: true }
            );

            setSuccessMessage("Respuestas guardadas exitosamente.");
        } catch (error) {
            console.error("Error al guardar las respuestas:", error);
            setErrorMessage("Error al guardar las respuestas.");
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
                            {evaluacionCruzada?.TITULO_EVAL_CRUZADA ||
                                "Evaluación Cruzada"}
                        </h1>
                        <p className="descripcion-autoevaluacion">
                            {evaluacionCruzada?.DESCRIPCION_EVAL_CRUZADA}
                        </p>
                        <div className="autoevaluacion-fechas">
                            <div className="autoevaluacion-fecha-item">
                                <span className="autoevaluacion-fecha-label">
                                    Fecha de inicio:
                                </span>
                                <span className="autoevaluacion-fecha-value">
                                    {formatFechaLarga(
                                        evaluacionCruzada?.FECHA_INICIO_EVAL
                                    )}
                                </span>
                            </div>
                            <div className="autoevaluacion-fecha-item">
                                <span className="autoevaluacion-fecha-label">
                                    Fecha de fin:
                                </span>
                                <span className="autoevaluacion-fecha-value">
                                    {formatFechaLarga(
                                        evaluacionCruzada?.FECHA_FIN_EVAL
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="dropdown-container">
                            <label htmlFor="estudiante-select">
                                Selecciona un compañero a evaluar:
                            </label>
                            <select
                                id="estudiante-select"
                                value={estudianteSeleccionado || ""}
                                onChange={(e) => {
                                    setEstudianteSeleccionado(
                                        parseInt(e.target.value, 10)
                                    );
                                    setResultado(null); // Resetea el resultado al seleccionar otro estudiante
                                }}
                            >
                                <option value="" disabled>
                                    -- Selecciona un estudiante --
                                </option>
                                {estudiantes.map((estudiante) => (
                                    <option
                                        key={estudiante.ID_EST}
                                        value={estudiante.ID_EST}
                                    >
                                        {estudiante.NOMBRE_EST}{" "}
                                        {estudiante.APELLIDO_EST}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {resultado ? (
                            <div className="autoevaluacion-resultado">
                                <h2>Evaluación Registrada</h2>
                                <p>
                                    <strong>Nota asignada:</strong>{" "}
                                    {resultado.PUNTUACION_OBTENIDA}
                                </p>
                                <p>
                                    Tu evaluación para este estudiante ha sido
                                    registrada exitosamente. Gracias por tu
                                    aporte para una evaluación justa y
                                    constructiva.
                                </p>
                            </div>
                        ) : evaluacionCruzada?.preguntas?.length > 0 ? (
                            <form onSubmit={handleSubmit}>
                                {evaluacionCruzada.preguntas.map((pregunta) => (
                                    <div
                                        key={pregunta.ID_PREGUNTA_EVAL}
                                        className="autoevaluacion-item"
                                    >
                                        <h4 className="pregunta-title">
                                            {pregunta.PREGUNTA_EVAL}
                                        </h4>
                                        <div className="opciones-container">
                                            {pregunta.opciones.map((opcion) => (
                                                <div
                                                    key={opcion.ID_OPCION_EVAL}
                                                    className="opcion-col"
                                                >
                                                    <span className="opcion-titulo">
                                                        {
                                                            opcion.TEXTO_OPCION_EVAL
                                                        }
                                                    </span>
                                                    <label className="opcion-radio">
                                                        <input
                                                            type="radio"
                                                            name={`pregunta-${pregunta.ID_PREGUNTA_EVAL}`}
                                                            value={
                                                                opcion.ID_OPCION_EVAL
                                                            }
                                                            onChange={() =>
                                                                handleResponseChange(
                                                                    pregunta.ID_PREGUNTA_EVAL,
                                                                    opcion.ID_OPCION_EVAL
                                                                )
                                                            }
                                                            checked={
                                                                respuestas[
                                                                    pregunta
                                                                        .ID_PREGUNTA_EVAL
                                                                ] ===
                                                                opcion.ID_OPCION_EVAL
                                                            }
                                                        />
                                                    </label>
                                                    <span className="opcion-puntos">
                                                        {
                                                            opcion.PUNTUACION_OPCION_EVAL
                                                        }
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <div className="form-footer">
                                    <button
                                        type="submit"
                                        className="save-button"
                                        disabled={
                                            !estudianteSeleccionado ||
                                            Object.keys(respuestas).length !==
                                                evaluacionCruzada.preguntas
                                                    .length
                                        }
                                    >
                                        Guardar Respuestas
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <p>No hay evaluaciones cruzadas disponibles.</p>
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

export default EvaluacionCruzadaEstudiante;
