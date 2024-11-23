import React, { useState } from "react";

const CriterioModal = ({ onSave, onClose }) => {
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [niveles, setNiveles] = useState([]);

    const addNivel = () => {
        setNiveles([...niveles, { puntos: "", titulo: "", descripcion: "" }]);
    };

    const updateNivel = (index, key, value) => {
        const updatedNiveles = [...niveles];
        updatedNiveles[index][key] = value;
        setNiveles(updatedNiveles);
    };

    const handleSave = () => {
        const newCriterio = { titulo, descripcion, niveles };
        onSave(newCriterio);
    };

    return (
        <div className="rubrica-modal-overlay">
            <div className="rubrica-modal-content">
                <h3>Nuevo Criterio</h3>
                <label>Título del Criterio</label>
                <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="modal-input"
                />
                <label>Descripción del Criterio</label>
                <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="modal-textarea"
                />

                {/* Niveles del Criterio */}
                {niveles.map((nivel, nivelIndex) => (
                    <div key={nivelIndex} className="nivel-editor">
                        <input
                            type="number"
                            placeholder="Puntos"
                            value={nivel.puntos}
                            onChange={(e) =>
                                updateNivel(nivelIndex, "puntos", e.target.value)
                            }
                            className="modal-input"
                        />
                        <input
                            type="text"
                            placeholder="Título del nivel"
                            value={nivel.titulo}
                            onChange={(e) =>
                                updateNivel(nivelIndex, "titulo", e.target.value)
                            }
                            className="modal-input"
                        />
                        <textarea
                            placeholder="Descripción"
                            value={nivel.descripcion}
                            onChange={(e) =>
                                updateNivel(nivelIndex, "descripcion", e.target.value)
                            }
                            className="modal-textarea"
                        />
                    </div>
                ))}
                <button onClick={addNivel} className="modal-button add-nivel-btn">
                    <i className="fas fa-plus"></i> Agregar Nivel
                </button>

                <div className="modal-actions">
                    <button
                        onClick={onClose}
                        className="modal-button cancel-btn"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="modal-button create-btn"
                    >
                        Guardar Criterio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CriterioModal;
