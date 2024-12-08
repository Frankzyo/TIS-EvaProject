import React, { useState } from "react";
import axios from "axios";

const FormBody = ({
    evaluaciones = [], // Evaluaciones inicializadas como array vacío
    setEvaluaciones,
    newPregunta = "", // Pregunta inicializada como string vacío
    setNewPregunta,
    opciones = [], // Opciones inicializadas como array vacío
    setOpciones,
    nuevaOpcion = { texto: "", puntuacion: 0 }, // Nueva opción inicializada con valores predeterminados
    setNuevaOpcion,
    projectId,
}) => {
    const [editMode, setEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState(null);

    // Manejar la edición de una pregunta
    const handleEditPreguntaClick = (index) => {
        const preguntaSeleccionada = evaluaciones[index];
        setNewPregunta(preguntaSeleccionada?.PREGUNTA_EVAL || ""); // Asegurar valor por defecto
        setOpciones(preguntaSeleccionada?.opciones || []); // Inicializar como array si es undefined
        setEditMode(true);
        setEditIndex(index); // Usar índice local para edición
    };

    // Guardar una pregunta editada localmente
    const handleSaveEditPregunta = () => {
        if (!newPregunta.trim() || opciones.length === 0) {
            alert("La pregunta y sus opciones no pueden estar vacías.");
            return;
        }

        const preguntasActualizadas = evaluaciones.map((pregunta, index) =>
            index === editIndex
                ? { ...pregunta, PREGUNTA_EVAL: newPregunta, opciones }
                : pregunta
        );

        setEvaluaciones(preguntasActualizadas);
        setEditMode(false);
        setEditIndex(null);
        setNewPregunta("");
        setOpciones([]);
        alert("Pregunta actualizada con éxito.");
    };

    // Cancelar edición
    const handleCancelEdit = () => {
        setEditMode(false);
        setEditIndex(null);
        setNewPregunta("");
        setOpciones([]);
    };

    // Eliminar una pregunta localmente
    const handleDeletePregunta = async (idPregunta) => {
        if (!idPregunta || isNaN(idPregunta)) {
            // Verifica que el ID sea numérico
            console.error("ID de pregunta no válido:", idPregunta);
            alert("ID de pregunta no válido.");
            return;
        }

        try {
            console.log(
                "URL para eliminar pregunta:",
                `http://localhost:8000/api/evaluacion-cruzada/preguntas/${idPregunta}`
            );
            await axios.delete(
                `http://localhost:8000/api/evaluacion-cruzada/preguntas/${idPregunta}`,
                { withCredentials: true }
            );

            setEvaluaciones((prevEvaluaciones) =>
                prevEvaluaciones.filter(
                    (pregunta) => pregunta.ID_PREGUNTA_EVAL !== idPregunta
                )
            );

            alert("Pregunta eliminada con éxito.");
        } catch (error) {
            console.error(
                "Error al eliminar la pregunta:",
                error.response?.data || error.message
            );
            alert("Error al eliminar la pregunta. Inténtalo nuevamente.");
        }
    };

    // Agregar una nueva opción localmente
    const handleAddOpcion = () => {
        if (!nuevaOpcion.texto.trim()) {
            alert("El texto de la opción no puede estar vacío.");
            return;
        }

        setOpciones((prevOpciones) => [...prevOpciones, { ...nuevaOpcion }]);
        setNuevaOpcion({ texto: "", puntuacion: 0 });
    };

    // Eliminar una opción localmente
    const handleRemoveOpcion = async (index) => {
        const opcionId = opciones[index]?.ID_OPCION_EVAL;

        if (!opcionId) {
            alert("ID de opción no válido.");
            return;
        }

        console.log(
            "URL para eliminar opción:",
            `http://localhost:8000/api/evaluacion-cruzada/opciones/${opcionId}`
        );
        console.log("ID de opción a eliminar:", opcionId);

        try {
            await axios.delete(
                `http://localhost:8000/api/evaluacion-cruzada/opciones/${opcionId}`,
                { withCredentials: true }
            );

            setOpciones((prevOpciones) =>
                prevOpciones.filter((_, i) => i !== index)
            );

            alert("Opción eliminada con éxito.");
        } catch (error) {
            console.error(
                "Error al eliminar la opción:",
                error.response?.data || error.message
            );
            alert("Error al eliminar la opción. Inténtalo nuevamente.");
        }
    };

    // Agregar una nueva pregunta localmente
    const handleAddPregunta = () => {
        if (!newPregunta.trim() || opciones.length === 0) {
            alert("Debe ingresar una pregunta válida con al menos una opción.");
            return;
        }

        const nuevaPregunta = {
            PREGUNTA_EVAL: newPregunta.trim(),
            opciones: [...opciones],
        };

        setEvaluaciones((prev) => [...prev, nuevaPregunta]);
        setNewPregunta("");
        setOpciones([]);
        alert("Pregunta agregada con éxito.");
    };

    return (
        <div className="form-body">
            <h3>Preguntas</h3>
            {evaluaciones.length === 0 ? (
                <p className="no-data-message">No hay preguntas creadas.</p>
            ) : (
                evaluaciones.map((pregunta, index) => (
                    <div key={index} className="form-question">
                        <div className="question-header">
                            <h4>{pregunta.PREGUNTA_EVAL || "Sin título"}</h4>
                            <div className="button-group">
                                <button
                                    onClick={() =>
                                        handleEditPreguntaClick(index)
                                    }
                                    className="edit-button"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() =>
                                        handleDeletePregunta(
                                            pregunta.ID_PREGUNTA_EVAL
                                        )
                                    }
                                    className="delete-button"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                        <ul className="option-list">
                            {pregunta.opciones?.length > 0 ? (
                                pregunta.opciones.map((opcion, i) => (
                                    <li key={i} className="option-item">
                                        <div className="option-text">
                                            <strong>
                                                {opcion.texto || "Sin texto"}
                                            </strong>
                                        </div>
                                        <div className="option-score">
                                            <span>Puntuación: </span>
                                            <span>
                                                {opcion.puntuacion || 0}
                                            </span>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p>No hay opciones.</p>
                            )}
                        </ul>
                    </div>
                ))
            )}

            <div className="add-question">
                <h3>{editMode ? "Editar Pregunta" : "Agregar Pregunta"}</h3>
                <input
                    type="text"
                    placeholder="Título de la pregunta"
                    value={newPregunta}
                    onChange={(e) => setNewPregunta(e.target.value)}
                    className="new-question-input"
                />
                <div className="options-container">
                    {opciones.map((opcion, index) => (
                        <div key={index} className="option-item">
                            <input
                                type="text"
                                value={opcion.texto || ""}
                                onChange={(e) => {
                                    const updatedOpciones = [...opciones];
                                    updatedOpciones[index].texto =
                                        e.target.value;
                                    setOpciones(updatedOpciones);
                                }}
                                placeholder="Texto de la opción"
                                className="new-option-input"
                            />
                            <input
                                type="number"
                                value={opcion.puntuacion || 0}
                                onChange={(e) => {
                                    const updatedOpciones = [...opciones];
                                    updatedOpciones[index].puntuacion = Number(
                                        e.target.value
                                    );
                                    setOpciones(updatedOpciones);
                                }}
                                placeholder="Puntuación"
                                min="0"
                                className="new-option-puntuacion-input"
                            />
                            {editMode && (
                                <button
                                    onClick={() => handleRemoveOpcion(index)}
                                    className="remove-option-btn"
                                >
                                    X
                                </button>
                            )}
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
                                    puntuacion: Number(e.target.value),
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
                {editMode ? (
                    <div className="edit-question-actions">
                        <button
                            onClick={handleSaveEditPregunta}
                            className="save-edit-btn"
                        >
                            Guardar Cambios
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="cancel-edit-btn"
                        >
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleAddPregunta}
                        className="add-question-btn"
                    >
                        Guardar Pregunta
                    </button>
                )}
            </div>
        </div>
    );
};

export default FormBody;
