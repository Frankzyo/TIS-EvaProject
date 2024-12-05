import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderProyecto from "../Components/HeaderProyecto";
import SidebarPrueba from "../Components/SidebarPrueba";
import "../../css/HeaderProyecto.css";
import "../../css/SidebarPrueba.css";
import "../../css/Autoevaluacion.css";
import axios from "axios";

const Autoevaluacion = () => {
    const { projectId } = useParams();
    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [autoevaluaciones, setAutoevaluaciones] = useState([]);
    const [newPregunta, setNewPregunta] = useState("");
    const [opciones, setOpciones] = useState([]);
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
        const fetchProjectDetails = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/proyectos/${projectId}`,
                    { withCredentials: true }
                );
                if (response.data) {
                    setProjectDetails(response.data);
                } else {
                    console.error("No se encontraron detalles del proyecto.");
                }
            } catch (error) {
                console.error("Error al cargar el proyecto:", error.message);
            }
        };

        fetchProjectDetails();
    }, [projectId]);

    useEffect(() => {
        const fetchAutoevaluaciones = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/proyectos/${projectId}/autoevaluaciones`,
                    { withCredentials: true }
                );
                if (Array.isArray(response.data)) {
                    setAutoevaluaciones(response.data);
                } else {
                    console.error(
                        "Error: No se recibieron autoevaluaciones válidas."
                    );
                }
            } catch (error) {
                console.error(
                    "Error al cargar las autoevaluaciones:",
                    error.message
                );
            }
        };

        fetchAutoevaluaciones();
    }, [projectId]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const handleAddOpcion = () => {
        if (nuevaOpcion.texto.trim() && nuevaOpcion.puntuacion >= 0) {
            setOpciones([...opciones, nuevaOpcion]);
            setNuevaOpcion({ texto: "", puntuacion: 0 });
        } else {
            alert(
                "Por favor, ingrese un texto y una puntuación válida para la opción."
            );
        }
    };

    const handleRemovePregunta = (index) => {
        setAutoevaluaciones((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveOpcion = (index) => {
        setOpciones((prev) => prev.filter((_, i) => i !== index));
    };

    const handleAddPregunta = () => {
        if (newPregunta.trim() && opciones.length > 0) {
            const nuevaPregunta = { pregunta: newPregunta, opciones };
            setAutoevaluaciones((prev) => [...prev, nuevaPregunta]);
            setNewPregunta("");
            setOpciones([]);
        } else {
            alert(
                "Por favor, ingrese una pregunta válida y al menos una opción."
            );
        }
    };

    const handleEditPregunta = (index) => {
        const preguntaSeleccionada = autoevaluaciones[index];
        setNewPregunta(preguntaSeleccionada.pregunta);
        setOpciones(preguntaSeleccionada.opciones);
        setEditIndex(index);
    };

    const handleSaveEditPregunta = () => {
        if (newPregunta.trim() && opciones.length > 0) {
            setAutoevaluaciones((prev) => {
                const updated = [...prev];
                updated[editIndex] = { pregunta: newPregunta, opciones };
                return updated;
            });
            setNewPregunta("");
            setOpciones([]);
            setEditIndex(null);
        } else {
            alert(
                "Por favor, ingrese una pregunta válida y al menos una opción."
            );
        }
    };

    const handleSaveAutoevaluaciones = async () => {
        const payload = {
            TITULO_AUTOEVAL: tituloFormulario,
            DESCRIPCION_AUTOEVAL: descripcionFormulario,
            FECHA_INICIO_AUTOEVAL: fechaInicio,
            FECHA_FIN_AUTOEVAL: fechaFin,
            autoevaluaciones: autoevaluaciones.map((autoeval) => ({
                pregunta: autoeval.pregunta,
                opciones: autoeval.opciones.map((opcion) => ({
                    texto: opcion.texto,
                    puntuacion: opcion.puntuacion,
                })),
            })),
        };
    
        console.log("Payload enviado:", payload);
    
        try {
            const response = await axios.post(
                `http://localhost:8000/api/proyectos/${projectId}/autoevaluaciones`,
                payload,
                { withCredentials: true }
            );
    
            console.log("Respuesta del servidor:", response.data);
    
            if (response.status === 201) {
                alert("Autoevaluaciones guardadas con éxito.");
                setTituloFormulario("");
                setDescripcionFormulario("");
                setFechaInicio("");
                setFechaFin("");
                setAutoevaluaciones([]);
            } else {
                console.error("Error en la respuesta:", response.data);
                alert("Hubo un error al guardar las autoevaluaciones.");
            }
        } catch (error) {
            console.error("Error al guardar:", error.response || error.message);
            alert("Hubo un error al guardar las autoevaluaciones.");
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
                                        setPuntuacionFormulario(e.target.value)
                                    }
                                />
                            </label>
                        </div>
                    </div>

                    {/* Cuerpo del formulario */}
                    <div className="form-body">
                        <h3>Preguntas</h3>
                        {autoevaluaciones.length === 0 ? (
                            <p>No hay autoevaluaciones creadas.</p>
                        ) : (
                            autoevaluaciones.map((item, index) => (
                                <div
                                    key={item.ID_AUTOEVAL_PROYECTO || index} // Clave única o índice
                                    className="form-question"
                                >
                                    <div className="question-header">
                                        <input
                                            type="text"
                                            value={item.TITULO_AUTOEVAL}
                                            readOnly
                                            className="question-input"
                                        />
                                        <button
                                            onClick={() =>
                                                handleEditAutoevaluacion(
                                                    item.ID_AUTOEVAL_PROYECTO
                                                )
                                            }
                                            className="edit-button"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteAutoevaluacion(
                                                    item.ID_AUTOEVAL_PROYECTO
                                                )
                                            }
                                            className="delete-button"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                    <ul className="option-list">
                                        {Array.isArray(item.preguntas) &&
                                            item.preguntas.map(
                                                (pregunta, i) => (
                                                    <li
                                                        key={
                                                            pregunta.ID_PREGUNTA_AUTOEVAL ||
                                                            i
                                                        } // Clave única o índice
                                                        className="option-item"
                                                    >
                                                        <span className="option-text">
                                                            {
                                                                pregunta.PREGUNTA_AUTOEVAL
                                                            }
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                handleDeletePregunta(
                                                                    pregunta.ID_PREGUNTA_AUTOEVAL
                                                                )
                                                            }
                                                            className="remove-option-btn"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </li>
                                                )
                                            )}
                                    </ul>
                                </div>
                            ))
                        )}

                        {/* Formulario para agregar preguntas */}
                        <div className="add-question">
                            <h4>Agregar Pregunta</h4>
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
                                        <span>
                                            {opcion.texto} (Puntuación:{" "}
                                            {opcion.puntuacion})
                                        </span>
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
                            onClick={handleSaveAutoevaluaciones}
                            className="save-form-btn"
                        >
                            Guardar Autoevaluación
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Autoevaluacion;
