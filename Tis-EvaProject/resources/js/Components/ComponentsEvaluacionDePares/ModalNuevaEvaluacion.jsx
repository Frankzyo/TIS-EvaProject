import React, { useState } from "react";
import "../../../css/ComponentsEvaluacionDePares/ModalNuevaEvaluacion.css";

const ModalNuevaEvaluacion = ({ onClose, onRegistrarEvaluacion }) => {
    const [datosEvaluacion, setDatosEvaluacion] = useState({
        titulo: "",       // Campo para el título
        descripcion: "",  // Nuevo campo para la descripción
        fecha_inicio: "", // Fecha de inicio
        fecha_fin: "",    // Fecha de fin
        nota_maxima: "",  // Nota máxima
    });

    const [errores, setErrores] = useState({}); // Manejo de errores

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDatosEvaluacion((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegistrar = async () => {
        if (
            !datosEvaluacion.titulo ||  // Validación del título
            !datosEvaluacion.descripcion ||  // Validación de la descripción
            !datosEvaluacion.fecha_inicio ||
            !datosEvaluacion.fecha_fin ||
            !datosEvaluacion.nota_maxima
        ) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        try {
            // Llama a la función del componente principal
            await onRegistrarEvaluacion(datosEvaluacion);
            setErrores({}); // Limpia errores si todo sale bien
        } catch (err) {
            if (err.response && err.response.data.errors) {
                setErrores(err.response.data.errors); // Actualiza errores del backend
            } else {
                console.error("Error inesperado:", err);
            }
        }
    };

    return (
        <div className="evaluacion-individual-modal-overlay">
            <div className="evaluacion-individual-modal-content">
                <h3 className="etapa-modal-title">
                    Registrar Evaluación de Pares
                </h3>

                <label className="etapa-label">Título de la Evaluación:</label>
                <input
                    type="text"
                    name="titulo"
                    value={datosEvaluacion.titulo}
                    onChange={handleChange}
                    placeholder="Ingrese el título de la evaluación"
                    className="input-field"
                />
                {errores.titulo && (
                    <p className="error-text">{errores.titulo[0]}</p>
                )}

                <label className="etapa-label">Descripción de la Evaluación:</label>
                <input
                    type="text"
                    name="descripcion"
                    value={datosEvaluacion.descripcion}
                    onChange={handleChange}
                    placeholder="Ingrese una descripción para la evaluación"
                    className="input-field"
                />
                {errores.descripcion && (
                    <p className="error-text">{errores.descripcion[0]}</p>
                )}

                <label className="etapa-label">Fecha de Inicio:</label>
                <input
                    type="date"
                    name="fecha_inicio"
                    value={datosEvaluacion.fecha_inicio}
                    onChange={handleChange}
                    className="input-field"
                />
                {errores.fecha_inicio && (
                    <p className="error-text">{errores.fecha_inicio[0]}</p>
                )}

                <label className="etapa-label">Fecha de Fin:</label>
                <input
                    type="date"
                    name="fecha_fin"
                    value={datosEvaluacion.fecha_fin}
                    onChange={handleChange}
                    className="input-field"
                />
                {errores.fecha_fin && (
                    <p className="error-text">{errores.fecha_fin[0]}</p>
                )}

                <label className="etapa-label">Nota Máxima:</label>
                <input
                    type="number"
                    name="nota_maxima"
                    value={datosEvaluacion.nota_maxima}
                    onChange={handleChange}
                    placeholder="Ingrese la nota máxima"
                    min="1"
                    className="input-field"
                />
                {errores.nota_maxima && (
                    <p className="error-text">{errores.nota_maxima[0]}</p>
                )}

                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-btn">
                        Cancelar
                    </button>
                    <button onClick={handleRegistrar} className="create-btn">
                        Registrar Evaluación
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalNuevaEvaluacion;
