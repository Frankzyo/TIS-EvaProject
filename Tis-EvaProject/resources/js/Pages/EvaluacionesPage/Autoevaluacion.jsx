import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import SidebarPrueba from "../../Components/ComponenteSidebar/SidebarPrueba";
import "../../../css/EstilosEvaluaciones/Autoevaluacion.css";
import "../../../css/EstilosSidebar/SidebarPrueba.css";
import "../../../css/EstilosEvaluaciones/Autoevaluacion.css";
import axios from "axios";

const Autoevaluacion = () => {
    const { projectId } = useParams();
    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [autoevaluaciones, setAutoevaluaciones] = useState([]);
    const [newPregunta, setNewPregunta] = useState("");
    const [opciones, setOpciones] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [nuevaOpcion, setNuevaOpcion] = useState({
        texto: "",
        puntuacion: 0,
    });
    const [tituloFormulario, setTituloFormulario] = useState("");
    const [descripcionFormulario, setDescripcionFormulario] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [puntuacionFormulario, setPuntuacionFormulario] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectResponse, autoevaluacionesResponse] =
                    await Promise.all([
                        axios.get(
                            `http://localhost:8000/api/proyectos/${projectId}`,
                            { withCredentials: true }
                        ),
                        axios.get(
                            `http://localhost:8000/api/proyectos/${projectId}/autoevaluaciones`,
                            { withCredentials: true }
                        ),
                    ]);

                setProjectDetails(projectResponse.data || {});

                if (autoevaluacionesResponse.data.length > 0) {
                    const autoevaluacion = autoevaluacionesResponse.data[0];
                    setTituloFormulario(autoevaluacion.TITULO_AUTOEVAL || "");
                    setDescripcionFormulario(
                        autoevaluacion.DESCRIPCION_AUTOEVAL || ""
                    );
                    setFechaInicio(autoevaluacion.FECHA_INICIO_AUTOEVAL || "");
                    setFechaFin(autoevaluacion.FECHA_FIN_AUTOEVAL || "");
                    setPuntuacionFormulario(
                        autoevaluacion.PUNTUACION_TOTAL_AUTOEVAL || 0
                    );
                    setAutoevaluaciones(autoevaluacion.preguntas || []);
                    setEditMode(true); // Activa modo edición
                } else {
                    setEditMode(false); // Modo creación
                }
            } catch (error) {
                console.error("Error al cargar los datos:", error.message);
            }
        };

        fetchData();
    }, [projectId]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const handleAddOpcion = () => {
        if (!nuevaOpcion.texto.trim()) {
            alert("El texto de la opción no puede estar vacío.");
            return;
        }

        if (
            opciones.some(
                (opcion) =>
                    opcion.texto.trim().toLowerCase() ===
                    nuevaOpcion.texto.trim().toLowerCase()
            )
        ) {
            alert("La opción ya existe.");
            return;
        }

        setOpciones((prevOpciones) => [
            ...prevOpciones,
            { ...nuevaOpcion, ID_OPCION_AUTOEVAL: Math.random() }, // Asignar ID único
        ]);
        setNuevaOpcion({ texto: "", puntuacion: 0 }); // Reiniciar el formulario
    };

    const handleEditAutoevaluacion = (idAutoevaluacion) => {
        const autoevaluacionSeleccionada = autoevaluaciones.find(
            (auto) => auto.ID_AUTOEVAL_PROYECTO === idAutoevaluacion
        );

        if (autoevaluacionSeleccionada) {
            setTituloFormulario(
                autoevaluacionSeleccionada.TITULO_AUTOEVAL || ""
            );
            setDescripcionFormulario(
                autoevaluacionSeleccionada.DESCRIPCION_AUTOEVAL || ""
            );
            setFechaInicio(
                autoevaluacionSeleccionada.FECHA_INICIO_AUTOEVAL || ""
            );
            setFechaFin(autoevaluacionSeleccionada.FECHA_FIN_AUTOEVAL || "");
        } else {
            console.error(
                `No se encontró la autoevaluación con ID ${idAutoevaluacion}.`
            );
        }
    };
    const handleDeleteAutoevaluacion = (idAutoevaluacion) => {
        setAutoevaluaciones((prev) =>
            prev.filter(
                (auto) => auto.ID_AUTOEVAL_PROYECTO !== idAutoevaluacion
            )
        );
    };
    const handleEditOption = (index) => {
        const newText = prompt("Nuevo texto:", opciones[index].texto);
        const newScore = parseInt(
            prompt("Nueva puntuación:", opciones[index].puntuacion),
            10
        );

        if (newText && !isNaN(newScore)) {
            setOpciones((prevOpciones) =>
                prevOpciones.map((opcion, i) =>
                    i === index
                        ? { ...opcion, texto: newText, puntuacion: newScore }
                        : opcion
                )
            );
        }
    };

    // Función para guardar las opciones editadas
    const handleSaveOptions = async () => {
        if (editIndex === null || opciones.length === 0) {
            alert("Debe seleccionar una pregunta y agregar opciones válidas.");
            return;
        }

        const payload = {
            opciones: opciones.map((opcion) => ({
                texto: opcion.texto.trim(),
                puntuacion: opcion.puntuacion,
            })),
        };

        try {
            const response = await axios.put(
                `http://localhost:8000/api/proyectos/${projectId}/autoevaluaciones/pregunta/${editIndex}/opciones`,
                payload,
                { withCredentials: true }
            );

            // Actualizar las opciones en el estado local
            setAutoevaluaciones((prev) => {
                const updated = [...prev];
                const preguntaIndex = updated[0]?.preguntas?.findIndex(
                    (p) => p.ID_PREGUNTA_AUTOEVAL === editIndex
                );

                if (preguntaIndex !== -1) {
                    updated[0].preguntas[preguntaIndex].opciones =
                        response.data.opciones; // Opciones actualizadas desde el backend
                }
                return updated;
            });

            alert("Opciones actualizadas con éxito.");
        } catch (error) {
            console.error("Error al guardar las opciones:", error);
            alert("Error al actualizar las opciones.");
        }
    };

    const handleDeleteOption = async (idOpcion) => {
        try {
            // Eliminar opción en el backend
            await axios.delete(
                `http://localhost:8000/api/proyectos/${projectId}/autoevaluaciones/opcion/${idOpcion}`,
                { withCredentials: true }
            );

            // Filtrar opciones en el estado local
            setOpciones((prevOpciones) =>
                prevOpciones.filter(
                    (opcion) => opcion.ID_OPCION_AUTOEVAL !== idOpcion
                )
            );

            alert("Opción eliminada con éxito.");
        } catch (error) {
            console.error("Error al eliminar la opción:", error);
            alert("Error al eliminar la opción. Inténtalo nuevamente.");
        }
    };

    const handleDeletePregunta = (idPregunta) => {
        // Eliminar del estado local
        setAutoevaluaciones((prev) =>
            prev.filter(
                (pregunta) => pregunta.ID_PREGUNTA_AUTOEVAL !== idPregunta
            )
        );

        // Si la pregunta tiene un ID real, también eliminar en el backend
        if (typeof idPregunta === "number") {
            axios
                .delete(
                    `http://localhost:8000/api/proyectos/${projectId}/autoevaluaciones/pregunta/${idPregunta}`,
                    { withCredentials: true }
                )
                .then(() => alert("Pregunta eliminada del backend."))
                .catch((error) =>
                    console.error(
                        "Error al eliminar la pregunta en el backend:",
                        error
                    )
                );
        }
    };

    const handleRemoveOpcion = (index) => {
        setOpciones((prevOpciones) =>
            prevOpciones.filter((_, i) => i !== index)
        );
    };

    const handleAddPregunta = async () => {
        if (!newPregunta.trim()) {
            alert("Por favor, ingrese una pregunta válida.");
            return;
        }

        if (opciones.length === 0) {
            alert("Debe agregar al menos una opción a la pregunta.");
            return;
        }

        // Construir la pregunta
        const nuevaPregunta = {
            PREGUNTA_AUTOEVAL: newPregunta.trim(),
            opciones: opciones.map((opcion) => ({
                texto: opcion.texto,
                puntuacion: opcion.puntuacion,
            })),
        };

        try {
            const response = await axios.post(
                `http://localhost:8000/api/proyectos/${projectId}/autoevaluaciones/pregunta`,
                nuevaPregunta,
                { withCredentials: true }
            );

            if (response.status === 201) {
                setAutoevaluaciones((prev) => [
                    ...prev,
                    {
                        ...nuevaPregunta,
                        ID_PREGUNTA_AUTOEVAL:
                            response.data.pregunta.ID_PREGUNTA_AUTOEVAL,
                    },
                ]);
                alert("Pregunta añadida con éxito.");
            }
        } catch (error) {
            console.error(
                "Error al guardar la pregunta:",
                error.response?.data || error.message
            );
            alert("Hubo un error al guardar la pregunta.");
        } finally {
            setNewPregunta(""); // Resetea el campo de pregunta
            setOpciones([]); // Limpia las opciones
        }
    };

    const handleEditPregunta = (idPregunta) => {
        // Encuentra la pregunta seleccionada en el estado local
        const preguntaSeleccionada = autoevaluaciones.find(
            (pregunta) => pregunta.ID_PREGUNTA_AUTOEVAL === idPregunta
        );

        if (preguntaSeleccionada) {
            setNewPregunta(preguntaSeleccionada.PREGUNTA_AUTOEVAL); // Cargar texto de la pregunta
            setOpciones(
                preguntaSeleccionada.opciones.map((opcion) => ({
                    texto: opcion.TEXTO_OPCION_AUTOEVAL,
                    puntuacion: opcion.PUNTUACION_OPCION_AUTOEVAL,
                }))
            ); // Cargar opciones
            setEditIndex(idPregunta); // Guardar el índice para identificar qué pregunta se está editando
        } else {
            alert("No se encontró la pregunta seleccionada.");
        }
    };

    const handleSaveEditPregunta = async () => {
        if (!editMode) {
            // Modo local: actualiza solo el estado local
            setAutoevaluaciones((prev) => {
                const updated = prev.map((pregunta) =>
                    pregunta.ID_PREGUNTA_AUTOEVAL === editIndex
                        ? {
                              ...pregunta,
                              PREGUNTA_AUTOEVAL: newPregunta.trim(),
                              opciones: opciones.map((opcion) => ({
                                  TEXTO_OPCION_AUTOEVAL: opcion.texto,
                                  PUNTUACION_OPCION_AUTOEVAL: opcion.puntuacion,
                              })),
                          }
                        : pregunta
                );
                return updated;
            });

            setNewPregunta("");
            setOpciones([]);
            setEditIndex(null);
            return;
        }

        // Modo edición (con datos en el backend): realizar la solicitud PUT
        if (!newPregunta.trim() || opciones.length === 0) {
            alert("La pregunta y sus opciones no pueden estar vacías.");
            return;
        }

        try {
            const payload = {
                PREGUNTA_AUTOEVAL: newPregunta.trim(),
                opciones: opciones.map((opcion) => ({
                    texto: opcion.texto.trim(),
                    puntuacion: opcion.puntuacion,
                })),
            };

            const response = await axios.put(
                `http://localhost:8000/api/proyectos/${projectId}/autoevaluaciones/pregunta/${editIndex}`,
                payload,
                { withCredentials: true }
            );

            setAutoevaluaciones((prev) => {
                const updated = prev.map((pregunta) =>
                    pregunta.ID_PREGUNTA_AUTOEVAL === editIndex
                        ? {
                              ...pregunta,
                              PREGUNTA_AUTOEVAL:
                                  response.data.PREGUNTA_AUTOEVAL,
                              opciones: response.data.opciones,
                          }
                        : pregunta
                );
                return updated;
            });

            alert("Pregunta y opciones actualizadas con éxito.");
            setNewPregunta("");
            setOpciones([]);
            setEditIndex(null);
        } catch (error) {
            console.error("Error al actualizar la pregunta:", error);
            alert("Error al actualizar la pregunta.");
        }
    };

    const handleSaveAutoevaluaciones = async () => {
        // Validación de fechas
        if (!fechaInicio || !fechaFin) {
            alert("Ambas fechas deben estar presentes.");
            return;
        }

        if (new Date(fechaInicio) > new Date(fechaFin)) {
            alert(
                "La fecha de inicio no puede ser posterior a la fecha de fin."
            );
            return;
        }

        // Validación de preguntas y opciones
        if (autoevaluaciones.length === 0) {
            alert(
                "Debe agregar al menos una pregunta para guardar la autoevaluación."
            );
            return;
        }

        for (const autoeval of autoevaluaciones) {
            if (!autoeval.PREGUNTA_AUTOEVAL || autoeval.opciones.length === 0) {
                alert(
                    "Todas las preguntas deben tener texto y al menos una opción."
                );
                return;
            }

            for (const opcion of autoeval.opciones) {
                if (
                    !opcion.TEXTO_OPCION_AUTOEVAL ||
                    opcion.PUNTUACION_OPCION_AUTOEVAL <= 0
                ) {
                    alert(
                        "Cada opción debe tener texto y una puntuación mayor a 0."
                    );
                    return;
                }
            }
        }

        // Crear el payload
        const payload = {
            TITULO_AUTOEVAL: tituloFormulario.trim(),
            DESCRIPCION_AUTOEVAL: descripcionFormulario.trim(),
            FECHA_INICIO_AUTOEVAL: fechaInicio,
            FECHA_FIN_AUTOEVAL: fechaFin,
            PUNTUACION_TOTAL_AUTOEVAL: puntuacionFormulario, // Campo añadido
            autoevaluaciones: autoevaluaciones.map((autoeval) => ({
                pregunta: autoeval.PREGUNTA_AUTOEVAL.trim(),
                opciones: autoeval.opciones.map((opcion) => ({
                    texto: opcion.TEXTO_OPCION_AUTOEVAL.trim(),
                    puntuacion: opcion.PUNTUACION_OPCION_AUTOEVAL,
                })),
            })),
        };

        try {
            const response = await axios.post(
                `http://localhost:8000/api/proyectos/${projectId}/autoevaluaciones`,
                payload,
                { withCredentials: true }
            );

            if (response.status === 201) {
                alert("Autoevaluaciones guardadas con éxito.");
                resetFormulario();
            } else {
                alert("Ocurrió un problema al guardar las autoevaluaciones.");
            }
        } catch (error) {
            if (error.response) {
                console.error(
                    "Error de respuesta del servidor:",
                    error.response.data
                );
                alert(
                    error.response.data.message ||
                        "Error en el servidor al guardar la autoevaluación."
                );
            } else if (error.request) {
                console.error("Error en la solicitud:", error.request);
                alert(
                    "No se pudo conectar al servidor. Verifique su conexión."
                );
            } else {
                console.error("Error desconocido:", error.message);
                alert("Ocurrió un error inesperado. Inténtelo nuevamente.");
            }
        }
    };

    const handleSaveAutoevaluacionDetails = async () => {
        if (
            !tituloFormulario.trim() ||
            !fechaInicio ||
            !fechaFin ||
            puntuacionFormulario <= 0
        ) {
            alert(
                "Todos los campos son obligatorios y deben tener valores válidos."
            );
            return;
        }

        if (new Date(fechaInicio) > new Date(fechaFin)) {
            alert(
                "La fecha de inicio no puede ser posterior a la fecha de fin."
            );
            return;
        }

        const payload = {
            TITULO_AUTOEVAL: tituloFormulario.trim(),
            DESCRIPCION_AUTOEVAL: descripcionFormulario.trim(),
            FECHA_INICIO_AUTOEVAL: fechaInicio,
            FECHA_FIN_AUTOEVAL: fechaFin,
            PUNTUACION_TOTAL_AUTOEVAL: puntuacionFormulario,
        };

        try {
            const response = await axios.put(
                `http://localhost:8000/api/proyectos/${projectId}/autoevaluaciones/${autoevaluaciones[0]?.ID_AUTOEVAL_PROYECTO}`,
                payload,
                { withCredentials: true }
            );

            if (response.status === 200) {
                alert("Autoevaluación actualizada con éxito.");
            } else {
                alert("Error al actualizar la autoevaluación.");
            }
        } catch (error) {
            console.error(
                "Error al guardar los detalles de la autoevaluación:",
                error
            );
            alert(
                "Ocurrió un error al guardar los cambios. Inténtalo nuevamente."
            );
        }
    };

    const handleSaveDetails = async () => {
        const payload = {
            TITULO_AUTOEVAL: tituloFormulario.trim(),
            DESCRIPCION_AUTOEVAL: descripcionFormulario.trim(),
            FECHA_INICIO_AUTOEVAL: fechaInicio,
            FECHA_FIN_AUTOEVAL: fechaFin,
            PUNTUACION_TOTAL_AUTOEVAL: parseInt(puntuacionFormulario, 10),
        };

        try {
            const response = await axios.put(
                `http://localhost:8000/api/proyectos/${projectId}/autoevaluaciones/${autoevaluaciones[0]?.ID_AUTOEVAL_PROYECTO}`,
                payload,
                { withCredentials: true }
            );

            alert("Autoevaluación actualizada con éxito.");
        } catch (error) {
            console.error(
                "Error al guardar los detalles de la autoevaluación:",
                error.response?.data || error
            );
            alert("Error al actualizar la autoevaluación.");
        }
    };
    const resetFormulario = () => {
        setTituloFormulario("");
        setDescripcionFormulario("");
        setFechaInicio("");
        setFechaFin("");
        setPuntuacionFormulario(0);
        setAutoevaluaciones([]);
        setNewPregunta("");
        setOpciones([]);
        setNuevaOpcion({ texto: "", puntuacion: 0 });
        setEditIndex(null);
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
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={
                        projectDetails?.NOMBRE_PROYECTO || "Cargando..."
                    }
                    fotoProyecto={
                        projectDetails?.PORTADA_PROYECTO
                            ? `http://localhost:8000/storage/${projectDetails.PORTADA_PROYECTO}`
                            : ""
                    }
                    projectId={projectId}
                />
                <div className="autoevaluacion-contain">
                    <div className="projects-header">
                        <h2>Gestión de Preguntas de Autoevaluación</h2>
                    </div>
                    {/* Encabezado del formulario */}
                    <div className="form-header">
                        <input
                            type="text"
                            className="form-title"
                            placeholder="Ingrese el título de la Autoevaluación"
                            value={tituloFormulario}
                            onChange={(e) =>
                                setTituloFormulario(e.target.value)
                            }
                        />
                        <textarea
                            className="form-description"
                            placeholder="Descripción del formulario"
                            value={descripcionFormulario}
                            onChange={(e) =>
                                setDescripcionFormulario(e.target.value)
                            }
                        />
                        <div className="form-dates">
                            <label>
                                Fecha de inicio:
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) =>
                                        setFechaInicio(e.target.value)
                                    }
                                />
                            </label>
                            <label>
                                Fecha de fin:
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) =>
                                        setFechaFin(e.target.value)
                                    }
                                />
                            </label>
                        </div>
                        <div className="form-dates">
                            <label>
                                Puntuación Total:
                                <input
                                    type="number"
                                    className="score-input"
                                    placeholder="0"
                                    min="0"
                                    value={puntuacionFormulario}
                                    onChange={(e) =>
                                        setPuntuacionFormulario(
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </label>
                        </div>
                    </div>

                    {/* Cuerpo del formulario */}
                    <div className="form-body">
                        <h3>Preguntas</h3>
                        {autoevaluaciones.length === 0 ? (
                            <p className="no-data-message">
                                {" "}
                                No hay preguntas creadas.
                            </p>
                        ) : (
                            autoevaluaciones.map((pregunta) => (
                                <div
                                    key={pregunta.ID_PREGUNTA_AUTOEVAL}
                                    className="form-question"
                                >
                                    <div className="question-header">
                                        <h4>{pregunta.PREGUNTA_AUTOEVAL}</h4>
                                        <div className="button-group">
                                            <button
                                                onClick={() =>
                                                    handleEditPregunta(
                                                        pregunta.ID_PREGUNTA_AUTOEVAL
                                                    )
                                                }
                                                className="edit-button"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeletePregunta(
                                                        pregunta.ID_PREGUNTA_AUTOEVAL
                                                    )
                                                }
                                                className="delete-button"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>

                                    <ul className="option-list">
                                        {pregunta.opciones?.map((opcion) => (
                                            <li
                                                key={
                                                    opcion.ID_OPCION_AUTOEVAL ||
                                                    Math.random()
                                                }
                                                className="option-item enhanced"
                                            >
                                                <div className="option-text">
                                                    <strong>
                                                        {
                                                            opcion.TEXTO_OPCION_AUTOEVAL
                                                        }
                                                    </strong>
                                                </div>
                                                <div className="option-score">
                                                    <span>Puntuación: </span>
                                                    <span className="score-value">
                                                        {
                                                            opcion.PUNTUACION_OPCION_AUTOEVAL
                                                        }
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        )}

                        {/* Formulario para agregar preguntas */}
                        <div className="add-question">
                            <h3>Agregar Pregunta</h3>
                            <input
                                type="text"
                                placeholder="Título de la nueva pregunta"
                                value={newPregunta}
                                onChange={(e) => setNewPregunta(e.target.value)}
                                className="new-question-input"
                            />
                            <div className="options-container">
                                {opciones.map((opcion, index) => (
                                    <div key={index} className="option-item">
                                        <input
                                            type="text"
                                            value={opcion.texto}
                                            onChange={(e) => {
                                                const updatedOpciones = [
                                                    ...opciones,
                                                ];
                                                updatedOpciones[index].texto =
                                                    e.target.value;
                                                setOpciones(updatedOpciones);
                                            }}
                                            placeholder="Texto de la opción"
                                            className="new-option-input"
                                        />
                                        <input
                                            type="number"
                                            value={opcion.puntuacion}
                                            onChange={(e) => {
                                                const updatedOpciones = [
                                                    ...opciones,
                                                ];
                                                updatedOpciones[
                                                    index
                                                ].puntuacion =
                                                    parseInt(
                                                        e.target.value,
                                                        10
                                                    ) || 0;
                                                setOpciones(updatedOpciones);
                                            }}
                                            placeholder="Puntuación"
                                            min="0"
                                            className="new-option-puntuacion-input"
                                        />
                                        <button
                                            onClick={() =>
                                                handleRemoveOpcion(index)
                                            }
                                            className="remove-option-btn"
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                                <div className="add-option">
                                    <input
                                        type="text"
                                        placeholder="Texto de la opción"
                                        value={nuevaOpcion.texto}
                                        onChange={(e) =>
                                            setNuevaOpcion({
                                                ...nuevaOpcion,
                                                texto: e.target.value,
                                            })
                                        }
                                        className="new-option-input"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Puntuación"
                                        min="0"
                                        value={nuevaOpcion.puntuacion}
                                        onChange={(e) =>
                                            setNuevaOpcion({
                                                ...nuevaOpcion,
                                                puntuacion:
                                                    parseInt(
                                                        e.target.value,
                                                        10
                                                    ) || 0,
                                            })
                                        }
                                        className="new-option-puntuacion-input"
                                    />
                                    <button
                                        onClick={handleAddOpcion}
                                        className="add-option-btn"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {editIndex === null ? (
                                <button
                                    onClick={handleAddPregunta}
                                    className="add-question-btn"
                                >
                                    Guardar Pregunta
                                </button>
                            ) : (
                                <button
                                    onClick={handleSaveEditPregunta}
                                    className="save-edit-btn"
                                >
                                    Guardar Cambios
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Pie del formulario */}
                    <div className="form-footer">
                        <button
                            onClick={
                                editMode
                                    ? handleSaveAutoevaluacionDetails
                                    : handleSaveAutoevaluaciones
                            }
                            className="save-form-btn"
                        >
                            {editMode
                                ? "Guardar Cambios de la Autoevaluación"
                                : "Crear Autoevaluación"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Autoevaluacion;
