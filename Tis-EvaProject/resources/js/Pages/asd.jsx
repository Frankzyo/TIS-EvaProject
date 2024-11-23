// Rubrica.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderProyecto from "../Components/HeaderProyecto";
import SidebarPrueba from "../Components/SidebarPrueba";
import "../../css/HeaderProyecto.css";
import "../../css/SidebarPrueba.css";
import "../../css/Rubrica.css";
import axios from "axios";

const Rubrica = () => {
    const { projectId, etapaId } = useParams();
    const [projectDetails, setProjectDetails] = useState({});
    const [etapaDetails, setEtapaDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [availablePoints, setAvailablePoints] = useState(0);
    const [rubricas, setRubricas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCriterioIndex, setCurrentCriterioIndex] = useState(null);

    // Obtener detalles del proyecto
    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/proyectos/${projectId}`,
                    { withCredentials: true }
                );
                setProjectDetails(response.data);
            } catch (error) {
                console.error("Error al cargar el proyecto:", error);
            }
        };
        fetchProjectDetails();
    }, [projectId]);

    // Obtener detalles de la etapa
    useEffect(() => {
        const fetchEtapaDetails = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/etapas/${etapaId}`,
                    { withCredentials: true }
                );
                setEtapaDetails(response.data);
                setAvailablePoints(response.data.ETAPAS_PUNTUACION);
            } catch (error) {
                console.error("Error al cargar la etapa:", error);
            }
        };
        fetchEtapaDetails();
    }, [etapaId]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    // Función para abrir el modal de nueva rúbrica
    const openNewRubricaModal = () => {
        setEditMode(false);
        setShowModal(true);
    };

    // Función para abrir el modal en modo edición y cargar datos
    const handleOpenEditModal = (index) => {
        setCurrentCriterioIndex(index);
        setEditMode(true);
        setShowModal(true);
    };

    // Función para eliminar un criterio
    const handleDeleteCriterio = (index) => {
        setRubricas((prevRubricas) => {
            const updatedRubricas = [...prevRubricas];
            updatedRubricas.splice(index, 1);
            return updatedRubricas;
        });
    };

    // Función para agregar o editar una rúbrica
    const addOrEditRubrica = (newRubrica) => {
        if (editMode) {
            // Editar rúbrica existente
            setRubricas((prevRubricas) => {
                const updatedRubricas = [...prevRubricas];
                updatedRubricas[currentCriterioIndex] = newRubrica;
                return updatedRubricas;
            });
        } else {
            // Agregar nueva rúbrica
            setRubricas([...rubricas, newRubrica]);
        }
        setShowModal(false);
    };

    return (
        <div
            className={`rubrica-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderProyecto />
            <div className="rubrica-sidebar-content">
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                />
                <div className="container">
                    <div className="etapa-container">
                        <div className="etapa-info">
                            <h3 className="etapa-title">
                                {etapaDetails.ETAPAS_TITULO}
                            </h3>
                            <p className="etapa-description">
                                {etapaDetails.ETAPAS_DESCRIPCION}
                            </p>
                            <div className="etapa-stats">
                                <span className="etapa-score">
                                    <strong>Puntuación:</strong>{" "}
                                    {etapaDetails.ETAPAS_PUNTUACION} pts
                                </span>
                                <span className="etapa-duration">
                                    <strong>Duración:</strong>{" "}
                                    {etapaDetails.ETAPAS_DURACION} semanas
                                </span>
                            </div>
                        </div>
                        <div className="available-points">
                            <span>
                                {availablePoints}/
                                {etapaDetails.ETAPAS_PUNTUACION} puntos
                                disponibles
                            </span>
                        </div>
                    </div>
                    <div className="projects-header">
                        <h2>Rubrica</h2>
                        <button
                            className="new-project-btn"
                            onClick={openNewRubricaModal}
                        >
                            <i className="fas fa-plus"></i> Nueva Rúbrica
                        </button>
                    </div>
                    <div className="rubrica-list">
                        {rubricas.map((rubrica, index) => (
                            <RubricaItem
                                key={index}
                                {...rubrica}
                                onEdit={() => handleOpenEditModal(index)}
                                onDelete={() => handleDeleteCriterio(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {showModal && (
                <NewRubricaModal
                    onAddOrEditRubrica={addOrEditRubrica}
                    onClose={() => setShowModal(false)}
                    editMode={editMode}
                    criterioToEdit={editMode ? rubricas[currentCriterioIndex] : null}
                />
            )}
        </div>
    );
};

// Componente para cada rúbrica individual
const RubricaItem = ({ titulo, criterios, onEdit, onDelete }) => (
    <div className="rubrica-item">
        <h3 className="rubrica-title">{titulo}</h3>
        <div className="criterios-list">
            {criterios.map((criterio, index) => (
                <Criterio
                    key={index}
                    {...criterio}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    </div>
);

// Componente para cada criterio dentro de una rúbrica con botones de acción
const Criterio = ({ titulo, descripcion, niveles, onEdit, onDelete }) => (
    <div className="criterio-item">
        <h4>{titulo}</h4>
        <p>{descripcion}</p>
        <div className="niveles-list">
            {niveles.map((nivel, index) => (
                <Nivel key={index} {...nivel} />
            ))}
        </div>
        <div className="project-actions">
            <button className="action-btn" onClick={onEdit}>
                <i className="fas fa-pen"></i>
            </button>
            <button className="action-btn" onClick={onDelete}>
                <i className="fas fa-trash"></i>
            </button>
        </div>
    </div>
);

// Componente para cada nivel dentro de un criterio
const Nivel = ({ puntos, titulo, descripcion }) => (
    <div className="nivel-item">
        <h5>
            {titulo} - {puntos} puntos
        </h5>
        <p>{descripcion}</p>
    </div>
);

// Modal para agregar o editar una rúbrica
const NewRubricaModal = ({ onAddOrEditRubrica, onClose, editMode, criterioToEdit }) => {
    const [titulo, setTitulo] = useState(criterioToEdit ? criterioToEdit.titulo : "");
    const [criterios, setCriterios] = useState(criterioToEdit ? criterioToEdit.criterios : []);

    const addCriterio = () => {
        setCriterios([
            ...criterios,
            { titulo: "", descripcion: "", niveles: [] },
        ]);
    };

    const addNivelToCriterio = (index) => {
        const newCriterios = [...criterios];
        newCriterios[index].niveles.push({
            puntos: "",
            titulo: "",
            descripcion: "",
        });
        setCriterios(newCriterios);
    };

    const updateCriterio = (index, key, value) => {
        const newCriterios = [...criterios];
        newCriterios[index][key] = value;
        setCriterios(newCriterios);
    };

    const updateNivel = (criterioIndex, nivelIndex, key, value) => {
        const newCriterios = [...criterios];
        newCriterios[criterioIndex].niveles[nivelIndex][key] = value;
        setCriterios(newCriterios);
    };

    const handleAddOrEdit = () => {
        onAddOrEditRubrica({ titulo, criterios });
    };

    return (
        <div className="rubrica-modal-overlay">
            <div className="rubrica-modal-content">
                <h3>{editMode ? "Editar Rúbrica" : "Nueva Rúbrica"}</h3>
                <label>Título de la Rúbrica</label>
                <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                />

                <button onClick={addCriterio}>Agregar Criterio</button>

                {criterios.map((criterio, criterioIndex) => (
                    <div key={criterioIndex} className="criterio-editor">
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
                        />
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
                        />
                        <button onClick={() => addNivelToCriterio(criterioIndex)}>
                            Agregar Nivel
                        </button>

                        {criterio.niveles.map((nivel, nivelIndex) => (
                            <div key={nivelIndex} className="nivel-editor">
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
                                />
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
                                />
                            </div>
                        ))}
                    </div>
                ))}

                <div className="rubrica-modal-actions">
                    <button onClick={onClose}>Cancelar</button>
                    <button onClick={handleAddOrEdit}>
                        {editMode ? "Guardar Cambios" : "Agregar"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Rubrica;
