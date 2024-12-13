import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import SidebarPrueba from "../../Components/ComponenteSidebar/SidebarPrueba";
import "../../../css/EstilosHeader/HeaderProyecto.css";
import "../../../css/EstilosSidebar/SidebarPrueba.css";
import "../../../css/EstilosEvaluaciones/EvaluacionDePares.css";
import FormHeader from "../../Components/ComponentsEvaluacionCruzada/FormHeader";
import FormBody from "../../Components/ComponentsEvaluacionCruzada/FormBody";

// Reutilizamos el mismo estilo
import axios from "axios";

const EvaluacionCruzada = () => {
    const { projectId } = useParams(); // Obtener projectId desde URL
    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Estados para la evaluación cruzada
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [tituloFormulario, setTituloFormulario] = useState("");
    const [descripcionFormulario, setDescripcionFormulario] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [puntuacionTotal, setPuntuacionTotal] = useState(0);
    const [newPregunta, setNewPregunta] = useState("");
    const [nuevaOpcion, setNuevaOpcion] = useState({
        texto: "",
        puntuacion: 0,
    });
    const [opciones, setOpciones] = useState([]); // Estado inicial como un array vacío
    const [editMode, setEditMode] = useState(false); // Agregado para manejar el modo edición
    const [isEditing, setIsEditing] = useState(false); // Indica si estamos en modo edición
    const [evaluacionId, setEvaluacionId] = useState(null); // ID de la evaluación actual

    // Fetch inicial: Validar projectId antes de hacer solicitudes
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectResponse, evaluacionesResponse] =
                    await Promise.all([
                        axios.get(
                            `http://localhost:8000/api/proyectos/${projectId}`,
                            { withCredentials: true }
                        ),
                        axios.get(
                            `http://localhost:8000/api/proyectos/${projectId}/evaluacion-cruzada`,
                            { withCredentials: true }
                        ),
                    ]);

                setProjectDetails(projectResponse.data || {});

                const evaluacionesData = evaluacionesResponse.data?.data || [];
                if (evaluacionesData.length > 0) {
                    const evaluacion = evaluacionesData[0];
                    setTituloFormulario(evaluacion.TITULO_EVAL_CRUZADA || "");
                    setDescripcionFormulario(
                        evaluacion.DESCRIPCION_EVAL_CRUZADA || ""
                    );
                    setFechaInicio(evaluacion.FECHA_INICIO_EVAL || "");
                    setFechaFin(evaluacion.FECHA_FIN_EVAL || "");
                    setPuntuacionTotal(evaluacion.PUNTUACION_TOTAL_EVAL || 0);
                    setEvaluacionId(evaluacion.ID_EVAL_CRUZADA || null);

                    const preguntasConOpciones = evaluacion.preguntas.map(
                        (pregunta) => ({
                            ID_PREGUNTA_EVAL: pregunta.ID_PREGUNTA_EVAL,
                            PREGUNTA_EVAL: pregunta.PREGUNTA_EVAL,
                            opciones: pregunta.opciones
                                .filter((opcion) => opcion.ID_OPCION_EVAL) // Filtrar opciones sin ID
                                .map((opcion) => ({
                                    ID_OPCION_EVAL: opcion.ID_OPCION_EVAL, // ID de la opción existente
                                    texto:
                                        opcion.TEXTO_OPCION_EVAL || "Sin texto",
                                    puntuacion:
                                        opcion.PUNTUACION_OPCION_EVAL || 0,
                                })),
                        })
                    );

                    setEvaluaciones(preguntasConOpciones);

                    setIsEditing(true);
                } else {
                    setIsEditing(false);
                }
            } catch (error) {
                console.error(
                    "Error al cargar los datos del backend:",
                    error.response?.data || error.message
                );
            }
        };

        fetchData();
    }, [projectId]);

    // Guardar evaluación completa
    const handleSaveOrUpdateEvaluacion = async () => {
        // Validación de campos obligatorios
        if (!tituloFormulario.trim() || !fechaInicio || !fechaFin) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        if (new Date(fechaInicio) > new Date(fechaFin)) {
            alert(
                "La fecha de inicio no puede ser posterior a la fecha de fin."
            );
            return;
        }

        if (evaluaciones.length === 0) {
            alert("Debe agregar al menos una pregunta.");
            return;
        }

        for (const evaluacion of evaluaciones) {
            if (!evaluacion.PREGUNTA_EVAL || evaluacion.opciones.length === 0) {
                alert(
                    "Todas las preguntas deben tener texto y al menos una opción."
                );
                return;
            }

            for (const opcion of evaluacion.opciones) {
                if (!opcion.texto || opcion.puntuacion <= 0) {
                    alert(
                        "Cada opción debe tener texto y una puntuación mayor a 0."
                    );
                    return;
                }
            }
        }

        // Crear el payload
        const payload = {
            TITULO_EVAL_CRUZADA: tituloFormulario.trim(),
            DESCRIPCION_EVAL_CRUZADA: descripcionFormulario.trim(),
            FECHA_INICIO_EVAL: fechaInicio,
            FECHA_FIN_EVAL: fechaFin,
            PUNTUACION_TOTAL_EVAL: puntuacionTotal,
            evaluaciones: evaluaciones.map((evaluacion) => ({
                ID_PREGUNTA_EVAL: evaluacion.ID_PREGUNTA_EVAL || null, // Si es nuevo, será null
                PREGUNTA_EVAL: evaluacion.PREGUNTA_EVAL.trim(),
                opciones: evaluacion.opciones.map((opcion) => ({
                    ID_OPCION_EVAL: opcion.ID_OPCION_EVAL || null, // Si es nuevo, será null
                    TEXTO_OPCION_EVAL: opcion.texto.trim(),
                    PUNTUACION_OPCION_EVAL: opcion.puntuacion,
                })),
            })),
        };

        try {
            let response;
            if (isEditing) {
                // Actualizar
                response = await axios.put(
                    `http://localhost:8000/api/proyectos/${projectId}/evaluacion-cruzada/${evaluacionId}`,
                    payload,
                    { withCredentials: true }
                );
            } else {
                // Crear
                response = await axios.post(
                    `http://localhost:8000/api/proyectos/${projectId}/evaluacion-cruzada`,
                    payload,
                    { withCredentials: true }
                );
            }

            if (response.status === 200 || response.status === 201) {
                alert(
                    isEditing
                        ? "Evaluación cruzada actualizada con éxito."
                        : "Evaluación cruzada guardada con éxito."
                );
            } else {
                alert(
                    isEditing
                        ? "Error al actualizar la evaluación cruzada."
                        : "Error al guardar la evaluación cruzada."
                );
            }
        } catch (error) {
            console.error("Error al procesar la evaluación cruzada:", error);
            alert("Ocurrió un error al procesar la evaluación cruzada.");
        }
    };

    return (
        <div
            className={`autoevaluacion-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderProyecto />
            <div className="autoevaluacion-sidebar-content">
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={() =>
                        setSidebarCollapsed(!isSidebarCollapsed)
                    }
                    nombreProyecto={
                        projectDetails?.NOMBRE_PROYECTO || "Cargando..."
                    }
                    fotoProyecto={
                        projectDetails?.PORTADA_PROYECTO
                            ? `/storage/${projectDetails.PORTADA_PROYECTO}`
                            : ""
                    }
                    projectId={projectId}
                />

                <div className="autoevaluacion-contain">
                    <div className="projects-header">
                        <h2>Gestión de Preguntas de Evaluación Cruzada</h2>
                    </div>
                    <FormHeader
                        tituloFormulario={tituloFormulario}
                        setTituloFormulario={setTituloFormulario}
                        descripcionFormulario={descripcionFormulario}
                        setDescripcionFormulario={setDescripcionFormulario}
                        fechaInicio={fechaInicio}
                        setFechaInicio={setFechaInicio}
                        fechaFin={fechaFin}
                        setFechaFin={setFechaFin}
                        puntuacionTotal={puntuacionTotal}
                        setPuntuacionTotal={setPuntuacionTotal}
                    />

                    <FormBody
                        evaluaciones={evaluaciones}
                        setEvaluaciones={setEvaluaciones}
                        newPregunta={newPregunta}
                        setNewPregunta={setNewPregunta}
                        opciones={opciones}
                        setOpciones={setOpciones}
                        nuevaOpcion={nuevaOpcion}
                        setNuevaOpcion={setNuevaOpcion}
                        projectId={projectId}
                    />
                    <div className="form-footer">
                        <button
                            onClick={handleSaveOrUpdateEvaluacion} // Usar la función combinada
                            className="save-form-btn"
                        >
                            {isEditing
                                ? "Actualizar Evaluación Cruzada"
                                : "Guardar Evaluación Cruzada"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvaluacionCruzada;
