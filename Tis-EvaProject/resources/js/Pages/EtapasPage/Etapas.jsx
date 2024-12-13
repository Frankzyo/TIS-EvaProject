import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Components
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import SidebarPrueba from "../../Components/ComponenteSidebar/SidebarPrueba";

// Styles
import "../../../css/EstilosHeader/HeaderProyecto.css";
import "../../../css/EstilosSidebar/SidebarPrueba.css";
import "../../../css/EstilosEtapa/Etapas.css";

// Custom Hooks
const useProjectData = (projectId) => {
    const [projectDetails, setProjectDetails] = useState({});
    const [etapas, setEtapas] = useState([]);
    const [totalPuntos, setTotalPuntos] = useState(0);

    const fetchProjectDetails = useCallback(async () => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/proyectos/${projectId}`,
                { withCredentials: true }
            );
            setProjectDetails(response.data);
        } catch (error) {
            console.error("Error al cargar el proyecto:", error);
        }
    }, [projectId]);

    const fetchEtapas = useCallback(async () => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/proyectos/${projectId}/etapas`,
                { withCredentials: true }
            );
            setEtapas(response.data);
            calculateTotalPoints(response.data);
        } catch (error) {
            console.error("Error al cargar las etapas:", error);
        }
    }, [projectId]);

    const calculateTotalPoints = (etapasData) => {
        const total = etapasData.reduce(
            (sum, etapa) => sum + (etapa.ETAPAS_PUNTUACION || 0),
            0
        );
        setTotalPuntos(total);
    };

    useEffect(() => {
        fetchProjectDetails();
        fetchEtapas();
    }, [fetchProjectDetails, fetchEtapas]);

    return {
        projectDetails,
        etapas,
        totalPuntos,
        setEtapas,
        setTotalPuntos,
        fetchEtapas,
    };
};

// Modal Component
const EtapaModal = ({
    isOpen,
    isEditMode,
    onClose,
    onSave,
    initialData = {},
}) => {
    const [titulo, setTitulo] = useState(initialData.ETAPAS_TITULO || "");
    const [descripcion, setDescripcion] = useState(
        initialData.ETAPAS_DESCRIPCION || ""
    );
    const [puntuacion, setPuntuacion] = useState(
        initialData.ETAPAS_PUNTUACION || ""
    );
    const [duracion, setDuracion] = useState(initialData.ETAPAS_DURACION || "");

    // Reset form when initial data changes
    useEffect(() => {
        setTitulo(initialData.ETAPAS_TITULO || "");
        setDescripcion(initialData.ETAPAS_DESCRIPCION || "");
        setPuntuacion(initialData.ETAPAS_PUNTUACION || "");
        setDuracion(initialData.ETAPAS_DURACION || "");
    }, [initialData]);

    const handleSave = () => {
        if (!titulo || !puntuacion || !duracion) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        onSave({
            ID_ETAPA: initialData.ID_ETAPA, // Include ID for editing
            etapas_titulo: titulo,
            etapas_descripcion: descripcion,
            etapas_puntuacion: puntuacion,
            etapas_duracion: duracion,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="etapa-modal-overlay">
            <div className="etapa-modal-content">
                <h3 className="etapa-modal-title">
                    {isEditMode ? "Editar Etapa" : "Crear Nueva Etapa"}
                </h3>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                >
                    <label className="etapa-label">Título:</label>
                    <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        className="etapa-input"
                        placeholder="Ingrese el título de la etapa"
                        required
                    />
                    <label className="etapa-label">Descripción:</label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        className="etapa-textarea"
                        placeholder="Descripción de la etapa"
                    ></textarea>
                    <label className="etapa-label">Puntuación (0-100):</label>
                    <input
                        type="number"
                        value={puntuacion}
                        onChange={(e) => setPuntuacion(e.target.value)}
                        className="etapa-input"
                        min="0"
                        max="100"
                        placeholder="Puntuación de la etapa"
                        required
                    />
                    <label className="etapa-label">Duración (semanas):</label>
                    <input
                        type="number"
                        value={duracion}
                        onChange={(e) => setDuracion(e.target.value)}
                        className="etapa-input"
                        min="1"
                        placeholder="Duración en semanas"
                        required
                    />
                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cancel-btn"
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="create-btn">
                            {isEditMode ? "Guardar" : "Agregar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Component
const Etapas = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showEtapaModal, setShowEtapaModal] = useState(false);
    const [editingEtapa, setEditingEtapa] = useState(null);

    const { projectDetails, etapas, totalPuntos, setEtapas, fetchEtapas } =
        useProjectData(projectId);

    const handleRubricaClick = (etapaId) => {
        navigate(`/proyectos/${projectId}/rubrica/${etapaId}`);
    };

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const openNewEtapaModal = () => {
        setEditingEtapa(null);
        setShowEtapaModal(true);
    };

    const openEditEtapaModal = (etapa) => {
        setEditingEtapa(etapa);
        setShowEtapaModal(true);
    };

    const closeEtapaModal = () => {
        setShowEtapaModal(false);
        setEditingEtapa(null);
    };

    const handleSaveEtapa = async (etapaData) => {
        try {
            if (editingEtapa) {
                // Update existing stage
                await axios.put(
                    `http://localhost:8000/api/etapas/${etapaData.ID_ETAPA}`,
                    {
                        etapas_titulo: etapaData.etapas_titulo,
                        etapas_descripcion: etapaData.etapas_descripcion,
                        etapas_puntuacion: etapaData.etapas_puntuacion,
                        etapas_duracion: etapaData.etapas_duracion,
                    },
                    { withCredentials: true }
                );

                // Refetch etapas to ensure consistency
                await fetchEtapas();
            } else {
                // Create new stage
                const response = await axios.post(
                    "http://localhost:8000/api/etapas",
                    {
                        etapas_titulo: etapaData.etapas_titulo,
                        etapas_descripcion: etapaData.etapas_descripcion,
                        etapas_puntuacion: etapaData.etapas_puntuacion,
                        etapas_duracion: etapaData.etapas_duracion,
                        id_proyecto: projectId,
                    },
                    { withCredentials: true }
                );

                // Refetch etapas to ensure consistency
                await fetchEtapas();
            }

            closeEtapaModal();
        } catch (error) {
            console.error("Error al guardar la etapa:", error);
            alert("Hubo un error al guardar la etapa. Intente nuevamente.");
        }
    };

    const handleDeleteEtapa = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/etapas/${id}`, {
                withCredentials: true,
            });

            // Refetch etapas to ensure consistency
            await fetchEtapas();
        } catch (error) {
            console.error("Error al eliminar la etapa:", error);
            alert("Hubo un error al eliminar la etapa. Intente nuevamente.");
        }
    };

    return (
        <div
            className={`etapas-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderProyecto />
            <div className="etapas-sidebar-content">
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                />
                <div className="container">
                    <div className="projects-header">
                        <h2>Etapas</h2>
                        <button
                            className="new-project-btn"
                            onClick={openNewEtapaModal}
                        >
                            <i className="fas fa-plus"></i> Nueva Etapa
                        </button>
                    </div>
                    <div
                        className={`total-puntos ${
                            totalPuntos > 100 ? "excede" : "normal"
                        }`}
                    >
                        {totalPuntos.toFixed(2)} / 100.00 puntos asignados
                    </div>

                    {etapas.length > 0 ? (
                        <div className="etapas-list">
                            {etapas.map((etapa) => (
                                <div
                                    key={etapa.ID_ETAPA}
                                    className="etapas-item"
                                >
                                    <div className="etapas-info">
                                        <h3 className="etapas-title">
                                            {etapa.ETAPAS_TITULO}{" "}
                                            <span className="etapas-score">
                                                ({etapa.ETAPAS_PUNTUACION} pts)
                                            </span>
                                        </h3>
                                        <p className="etapas-duration">
                                            <strong>Duración:</strong>{" "}
                                            {etapa.ETAPAS_DURACION} semanas
                                        </p>
                                        <p className="etapas-description">
                                            {etapa.ETAPAS_DESCRIPCION}
                                        </p>
                                    </div>

                                    <div className="etapas-actions">
                                        <button
                                            className="registered-button"
                                            onClick={() =>
                                                handleRubricaClick(
                                                    etapa.ID_ETAPA
                                                )
                                            }
                                        >
                                            Rubrica
                                        </button>

                                        <button
                                            className="action-btns edit-btn"
                                            onClick={() =>
                                                openEditEtapaModal(etapa)
                                            }
                                        >
                                            <i className="fas fa-pen"></i>
                                        </button>
                                        <button
                                            className="action-btns delete-btn"
                                            onClick={() =>
                                                handleDeleteEtapa(
                                                    etapa.ID_ETAPA
                                                )
                                            }
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data-message">
                            No hay etapas registradas.
                        </p>
                    )}
                </div>
            </div>

            <EtapaModal
                isOpen={showEtapaModal}
                isEditMode={!!editingEtapa}
                onClose={closeEtapaModal}
                onSave={handleSaveEtapa}
                initialData={editingEtapa || {}}
            />
        </div>
    );
};

export default Etapas;
