// Rubrica.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import SidebarPrueba from "../../Components/ComponenteSidebar/SidebarPrueba";
import RubricaItem from "../../Components/ComponentsRubrica/RubricaItem";
import NewRubricaModal from "../../Components/ComponentsRubrica/NewRubricaModal";
import "../../../css/EstilosRubrica/Rubrica.css";
import axios from "axios";

const Rubrica = () => {
    const { projectId, etapaId } = useParams();
    const [projectDetails, setProjectDetails] = useState({});
    const [availablePoints, setAvailablePoints] = useState(0);
    const [etapaDetails, setEtapaDetails] = useState({});
    const [rubricas, setRubricas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [rubricaToEdit, setRubricaToEdit] = useState(null);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

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

    useEffect(() => {
        const fetchRubricas = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/rubricas/${projectId}/${etapaId}`
                );
                setRubricas(response.data);
            } catch (error) {
                console.error("Error al cargar las rúbricas:", error);
            }
        };
        fetchRubricas();
    }, [projectId, etapaId]);

    const openNewRubricaModal = () => {
        setIsEditMode(false);
        setRubricaToEdit(null);
        setShowModal(true);
    };

    const handleEditRubrica = (rubrica) => {
        if (rubrica?.ID_RUBRICA) {
            setIsEditMode(true);
            setRubricaToEdit(rubrica);
            setShowModal(true);
        } else {
            console.error(
                "No se puede editar esta rúbrica porque falta el ID."
            );
        }
    };

    const handleDeleteRubrica = async (rubricaId) => {
        try {
            await axios.delete(
                `http://localhost:8000/api/rubricas/${rubricaId}`
            );
            setRubricas((prevRubricas) =>
                prevRubricas.filter((r) => r.ID_RUBRICA !== rubricaId)
            );
            alert("Rúbrica eliminada con éxito");
        } catch (error) {
            console.error("Error al eliminar la rúbrica:", error);
            alert("Error al eliminar la rúbrica");
        }
    };

    const handleSaveRubrica = async (newRubrica) => {
        try {
            if (isEditMode && newRubrica.ID_RUBRICA) {
                setRubricas((prevRubricas) =>
                    prevRubricas.map((rubrica) =>
                        rubrica.ID_RUBRICA === newRubrica.ID_RUBRICA
                            ? newRubrica
                            : rubrica
                    )
                );
            } else {
                const response = await axios.get(
                    `http://localhost:8000/api/rubricas/${projectId}/${etapaId}`
                );
                setRubricas(response.data);
            }
            setShowModal(false);
        } catch (error) {
            console.error("Error al guardar la rúbrica:", error);
        }
    };

    // Calcula el puntaje total de las rúbricas en función de los puntos de la etapa
    const totalRubricaPoints = rubricas.reduce(
        (total, rubrica) => total + (rubrica.PESO_RUBRICA || 0),
        0
    );
    const scaledRubricaPoints =
        (totalRubricaPoints / 100) * etapaDetails.ETAPAS_PUNTUACION;

    // Determina la clase para el estilo dependiendo de si se excede el puntaje
    const pointsClass =
        scaledRubricaPoints > etapaDetails.ETAPAS_PUNTUACION
            ? "exceeded"
            : "normal";

    return (
        <div className="rubrica-container">
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
                        <div className={`available-points ${pointsClass}`}>
                            <span>
                                {(scaledRubricaPoints || 0).toFixed(2)} /{" "}
                                {(etapaDetails.ETAPAS_PUNTUACION || 0).toFixed(
                                    2
                                )}{" "}
                                puntos asignados
                            </span>
                        </div>
                    </div>
                    <div className="projects-header">
                        <h2>Rúbricas</h2>
                        <button
                            onClick={openNewRubricaModal}
                            className="new-project-btn"
                        >
                            <i className="fas fa-plus"></i> Nueva Rúbrica
                        </button>
                    </div>
                    <div className="rubrica-list">
                        {rubricas.length > 0 ? (
                            rubricas.map((rubrica, index) => (
                                <RubricaItem
                                    key={index}
                                    rubrica={rubrica}
                                    onEdit={() => handleEditRubrica(rubrica)}
                                    onDelete={() =>
                                        handleDeleteRubrica(rubrica.ID_RUBRICA)
                                    }
                                />
                            ))
                        ) : (
                            <p className="no-data-message">
                                No hay rúbricas registradas.
                            </p>
                        )}
                    </div>
                </div>
                {showModal && (
                    <NewRubricaModal
                        isEditMode={isEditMode}
                        rubrica={rubricaToEdit}
                        onSave={handleSaveRubrica}
                        onClose={() => setShowModal(false)}
                        projectId={projectId}
                        etapaId={etapaId}
                    />
                )}
            </div>
        </div>
    );
};
export default Rubrica;
