import React, { useState, useEffect } from "react";
import "../../../css/EstilosRubrica/NewRubricaModal.css";
import axios from "axios";

const NewRubricaModal = ({
    isEditMode,
    rubrica,
    onSave,
    onClose,
    projectId,
    etapaId,
}) => {
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [criterios, setCriterios] = useState([]);
    const [menuIndex, setMenuIndex] = useState(null);
    const [nivelMenuIndex, setNivelMenuIndex] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isEditMode && rubrica) {
            setTitulo(rubrica.NOMBRE_RUBRICA || "");
            setDescripcion(rubrica.DESCRIPCION_RUBRICA || "");
            setCriterios(
                rubrica.criterios?.map((criterio) => ({
                    id: criterio.ID_CRITERIO, // Incluir el ID del criterio
                    titulo: criterio.NOMBRE_CRITERIO || "",
                    descripcion: criterio.DESCRIPCION_CRITERIO || "",
                    niveles: criterio.niveles?.map((nivel) => ({
                        id: nivel.ID_NIVEL, // Incluir el ID del nivel
                        puntos: nivel.PUNTOS !== undefined ? nivel.PUNTOS : "", // Cambia aquí para que '0' se mantenga
                        titulo: nivel.TITULO_NIVEL || "",
                        descripcion: nivel.DESCRIPCION_NIVEL || "",
                    })),
                })) || []
            );

            // Log para mostrar los IDs de criterio y nivel
            const criterioIds =
                rubrica.criterios?.map((criterio) => criterio.ID_CRITERIO) ||
                [];
            const nivelIds =
                rubrica.criterios?.flatMap(
                    (criterio) =>
                        criterio.niveles?.map((nivel) => nivel.ID_NIVEL) || []
                ) || [];

            console.log("Criterio IDs:", criterioIds);
            console.log("Nivel IDs:", nivelIds);
        }
    }, [isEditMode, rubrica]);

    const addCriterio = () => {
        setCriterios([
            ...criterios,
            {
                titulo: "",
                descripcion: "",
                niveles: [{ puntos: "", titulo: "", descripcion: "" }],
            },
        ]);
    };

    const addNivelToCriterio = (criterioIndex) => {
        const newCriterios = [...criterios];
        newCriterios[criterioIndex].niveles.push({
            puntos: "",
            titulo: "",
            descripcion: "",
        });
        setCriterios(newCriterios);
        setNivelMenuIndex(null);
    };

    const handleSave = async () => {
        setError(""); // Limpia errores previos

        if (!titulo.trim()) {
            setError("El título de la rúbrica es obligatorio.");
            return;
        }

        if (criterios.length === 0) {
            setError("Debe haber al menos un criterio.");
            return;
        }

        // Validación manual de criterios y niveles
        for (let i = 0; i < criterios.length; i++) {
            const criterio = criterios[i];
            if (!criterio.titulo.trim()) {
                setError(`El criterio ${i + 1} debe tener un título.`);
                return;
            }

            if (criterio.niveles.length === 0) {
                setError(`El criterio ${i + 1} debe tener al menos un nivel.`);
                return;
            }

            for (let j = 0; j < criterio.niveles.length; j++) {
                const nivel = criterio.niveles[j];
                if (!nivel.titulo.trim()) {
                    setError(
                        `El nivel ${j + 1} del criterio ${
                            i + 1
                        } debe tener un título.`
                    );
                    return;
                }

                if (nivel.puntos === "" || nivel.puntos === null) {
                    setError(
                        `El nivel ${j + 1} del criterio ${
                            i + 1
                        } debe tener un puntaje.`
                    );
                    return;
                }
            }
        }

        const newRubrica = {
            titulo,
            descripcion,
            criterios: criterios.map((criterio) => ({
                id: criterio.id, // Incluir solo si existe
                titulo: criterio.titulo,
                descripcion: criterio.descripcion,
                maxPuntaje: Math.max(
                    ...criterio.niveles.map((nivel) =>
                        Number(nivel.puntos || 0)
                    )
                ),
                niveles: criterio.niveles.map((nivel) => ({
                    id: nivel.id, // Incluir solo si existe
                    puntos: nivel.puntos,
                    titulo: nivel.titulo,
                    descripcion: nivel.descripcion,
                })),
            })),
            projectId,
            etapaId,
        };

        try {
            if (isEditMode && rubrica?.ID_RUBRICA) {
                await axios.put(
                    `http://localhost:8000/api/rubricas/${rubrica.ID_RUBRICA}`,
                    newRubrica
                );
            } else {
                await axios.post(
                    "http://localhost:8000/api/rubricas",
                    newRubrica
                );
            }

            onSave(newRubrica);
            onClose();
        } catch (error) {
            console.error(
                "Error al guardar la rúbrica:",
                error.response?.data || error
            );
            setError(
                error.response?.data?.message ||
                    "Error al guardar la rúbrica. Por favor, inténtelo de nuevo."
            );
        }
    };

    const handleDelete = async () => {
        if (!isEditMode || !rubrica.id) return;

        try {
            await axios.delete(
                `http://localhost:8000/api/rubricas/${rubrica.id}`
            );
            onClose(); // Cierra el modal
            onSave(); // Actualiza la lista de rúbricas después de eliminar
        } catch (error) {
            console.error("Error al eliminar la rúbrica:", error);
            setError(
                "Error al eliminar la rúbrica. Por favor, inténtelo de nuevo."
            );
        }
    };

    const updateCriterio = (index, key, value) => {
        setCriterios((prev) =>
            prev.map((c, i) => (i === index ? { ...c, [key]: value } : c))
        );
    };

    const updateNivel = (criterioIndex, nivelIndex, key, value) => {
        const updatedCriterios = [...criterios];
        // Si el valor es vacío, asigna 0 en su lugar
        if (key === "puntos" && (value === "" || value === null)) {
            value = 0;
        }
        updatedCriterios[criterioIndex].niveles[nivelIndex][key] = value;
        setCriterios(updatedCriterios);
    };

    const deleteCriterio = (index) => {
        setCriterios(criterios.filter((_, i) => i !== index));
        setMenuIndex(null);
    };

    const cloneCriterio = (index) => {
        const newCriterio = {
            ...criterios[index],
            niveles: [...criterios[index].niveles],
        };
        setCriterios([...criterios, newCriterio]);
        setMenuIndex(null);
    };

    const deleteNivel = (criterioIndex, nivelIndex) => {
        const newCriterios = [...criterios];
        newCriterios[criterioIndex].niveles = newCriterios[
            criterioIndex
        ].niveles.filter((_, i) => i !== nivelIndex);
        setCriterios(newCriterios);
        setNivelMenuIndex(null);
    };

    const cloneNivel = (criterioIndex, nivelIndex) => {
        const newCriterios = [...criterios];
        const nivelToClone = newCriterios[criterioIndex].niveles[nivelIndex];
        newCriterios[criterioIndex].niveles.push({ ...nivelToClone });
        setCriterios(newCriterios);
        setNivelMenuIndex(null);
    };

    const toggleMenu = (index, type, subIndex = null) => {
        if (type === "criterio") {
            setMenuIndex(menuIndex === index ? null : index);
            setNivelMenuIndex(null);
        } else if (type === "nivel") {
            setNivelMenuIndex(
                nivelMenuIndex === `${index}-${subIndex}`
                    ? null
                    : `${index}-${subIndex}`
            );
            setMenuIndex(null);
        }
    };

    return (
        <div className="rubrica-modal-overlay">
            <div className="rubrica-modal-content">
                <h3 className="etapa-modal-title">
                    {isEditMode ? "Editar Rúbrica" : "Nueva Rúbrica"}
                </h3>
                <label className="etapa-label">Título de la Rúbrica:</label>
                <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="rubrica-modal-input"
                    placeholder="Ingrese el título de la rubrica"
                />
                <label className="etapa-label">
                    Descripción de la Rúbrica:
                </label>
                <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="rubrica-modal-textarea"
                    placeholder="Descripción de la rubrica"
                />

                {criterios.map((criterio, criterioIndex) => (
                    <div key={criterioIndex} className="criterio-editor">
                        <div className="criterio-header">
                            <div className="criterio-info">
                                <input
                                    type="text"
                                    placeholder="Título del criterio"
                                    value={criterio.titulo}
                                    onChange={(e) =>
                                        updateCriterio(
                                            criterioIndex,
                                            "titulo",
                                            e.target.value
                                        )
                                    }
                                    className="criterio-input"
                                />
                            </div>
                            <div className="menu-container">
                                <button
                                    className="menu-button"
                                    onClick={() =>
                                        toggleMenu(criterioIndex, "criterio")
                                    }
                                >
                                    <i className="fas fa-ellipsis-v"></i>
                                </button>
                                {menuIndex === criterioIndex && (
                                    <div className="dropdown-etapa-menu">
                                        <button
                                            onClick={() =>
                                                deleteCriterio(criterioIndex)
                                            }
                                            className="dropdown-etapa-item"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <textarea
                            placeholder="Descripción del criterio"
                            value={criterio.descripcion}
                            onChange={(e) =>
                                updateCriterio(
                                    criterioIndex,
                                    "descripcion",
                                    e.target.value
                                )
                            }
                            className="rubrica-modal-textarea"
                        />
                        <div className="niveles-container">
                            {criterio.niveles.map((nivel, nivelIndex) => (
                                <div key={nivelIndex} className="nivel-editor">
                                    <div className="nivel-header">
                                        <div className="nivel-info">
                                            <input
                                                type="number"
                                                placeholder="Puntos"
                                                value={nivel.puntos}
                                                onChange={(e) =>
                                                    updateNivel(
                                                        criterioIndex,
                                                        nivelIndex,
                                                        "puntos",
                                                        e.target.value
                                                    )
                                                }
                                                className="nivel-input"
                                            />
                                        </div>
                                        <div className="nivel-menu-container">
                                            <button
                                                className="nivel-menu-button"
                                                onClick={() =>
                                                    toggleMenu(
                                                        criterioIndex,
                                                        "nivel",
                                                        nivelIndex
                                                    )
                                                }
                                            >
                                                <i className="fas fa-ellipsis-v"></i>
                                            </button>
                                            {nivelMenuIndex ===
                                                `${criterioIndex}-${nivelIndex}` && (
                                                <div className="dropdown-etapa-menu">
                                                    <button
                                                        onClick={() =>
                                                            deleteNivel(
                                                                criterioIndex,
                                                                nivelIndex
                                                            )
                                                        }
                                                        className="dropdown-etapa-item"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {nivelIndex ===
                                            criterio.niveles.length - 1 && (
                                            <button
                                                className="add-nivel-btn right"
                                                onClick={() =>
                                                    addNivelToCriterio(
                                                        criterioIndex
                                                    )
                                                }
                                            >
                                                +
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Título del nivel"
                                        value={nivel.titulo}
                                        onChange={(e) =>
                                            updateNivel(
                                                criterioIndex,
                                                nivelIndex,
                                                "titulo",
                                                e.target.value
                                            )
                                        }
                                        className="nivel-input"
                                    />
                                    <textarea
                                        placeholder="Descripción"
                                        value={nivel.descripcion}
                                        onChange={(e) =>
                                            updateNivel(
                                                criterioIndex,
                                                nivelIndex,
                                                "descripcion",
                                                e.target.value
                                            )
                                        }
                                        className="nivel-textarea"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <button onClick={addCriterio} className="create-btn">
                    Agregar Criterio
                </button>
                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-btn">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="create-btn">
                        {isEditMode ? "Actualizar" : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewRubricaModal;
