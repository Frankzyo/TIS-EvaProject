import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderProyecto from "../Components/HeaderProyecto";
import SidebarPrueba from "../Components/SidebarPrueba";
import "../../css/HeaderProyecto.css";
import "../../css/SidebarPrueba.css";
import "../../css/Etapas.css";
import axios from "axios";

const Etapas = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [etapas, setEtapas] = useState([]);
    const [showEtapaModal, setShowEtapaModal] = useState(false);
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [puntuacion, setPuntuacion] = useState("");
    const [duracion, setDuracion] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editEtapaId, setEditEtapaId] = useState(null);
    const [totalPuntos, setTotalPuntos] = useState(0);

    const handleRubricaClick = (etapaId) => {
        navigate(`/proyectos/${projectId}/rubrica/${etapaId}`);
    };

    // Cargar detalles del proyecto y etapas
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

        const fetchEtapas = async () => {
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
        };

        fetchProjectDetails();
        fetchEtapas();
    }, [projectId]);

    const calculateTotalPoints = (etapas) => {
        const total = etapas.reduce(
            (sum, etapa) => sum + Number(etapa.ETAPAS_PUNTUACION || 0), // Usa Number para convertir
            0
        );
        setTotalPuntos(total);
    };

    useEffect(() => {
        const total = etapas.reduce(
            (sum, etapa) => sum + Number(etapa.ETAPAS_PUNTUACION || 0),
            0
        );
        setTotalPuntos(Number.isFinite(total) ? total : 0); // Validar total
    }, [etapas]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const openEtapaModal = () => {
        setShowEtapaModal(true);
        setIsEditMode(false);
        setTitulo("");
        setDescripcion("");
        setPuntuacion("");
        setDuracion("");
    };

    const openEditEtapaModal = (etapa) => {
        setShowEtapaModal(true);
        setIsEditMode(true);
        setEditEtapaId(etapa.ID_ETAPA); // Usar el nombre exacto del backend
        setTitulo(etapa.ETAPAS_TITULO);
        setDescripcion(etapa.ETAPAS_DESCRIPCION);
        setPuntuacion(etapa.ETAPAS_PUNTUACION);
        setDuracion(etapa.ETAPAS_DURACION);
    };

    const closeEtapaModal = () => {
        setShowEtapaModal(false);
        setIsEditMode(false);
        setEditEtapaId(null);
    };

    const handleSaveEtapa = async () => {
        if (!titulo || !puntuacion || !duracion) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const etapaData = {
            etapas_titulo: titulo,
            etapas_descripcion: descripcion,
            etapas_puntuacion: puntuacion,
            etapas_duracion: duracion,
        };

        try {
            if (isEditMode) {
                // Actualizar etapa existente
                await axios.put(
                    `http://localhost:8000/api/etapas/${editEtapaId}`,
                    etapaData,
                    {
                        withCredentials: true,
                    }
                );
                setEtapas(
                    etapas.map((etapa) =>
                        etapa.id_etapa === editEtapaId
                            ? { ...etapa, ...etapaData }
                            : etapa
                    )
                );
            } else {
                // Crear nueva etapa
                const response = await axios.post(
                    "http://localhost:8000/api/etapas",
                    {
                        ...etapaData,
                        id_proyecto: projectId,
                    },
                    {
                        withCredentials: true,
                    }
                );
                setEtapas([...etapas, response.data.etapa]);
            }

            closeEtapaModal();
        } catch (error) {
            console.error("Error al guardar la etapa:", error);
        }
    };

    const handleDeleteEtapa = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/etapas/${id}`, {
                withCredentials: true,
            });
            setEtapas(etapas.filter((etapa) => etapa.id_etapa !== id));
        } catch (error) {
            console.error("Error al eliminar la etapa:", error);
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
                            onClick={openEtapaModal}
                        >
                            <i className="fas fa-plus"></i> Nueva Etapa
                        </button>
                    </div>
                    <div
                        className={`total-puntos ${
                            totalPuntos > 100 ? "excede" : "normal"
                        }`}
                    >
                        {Number.isFinite(totalPuntos)
                            ? `${totalPuntos.toFixed(
                                  2
                              )} / 100.00 puntos asignados`
                            : "0.00 / 100.00 puntos asignados"}
                    </div>

                    {etapas.length > 0 ? (
                        <div className="etapas-list">
                            {etapas.map((etapa, index) => (
                                <div
                                    key={etapa.ID_ETAPA || index}
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

            {showEtapaModal && (
                <div className="etapa-modal-overlay">
                    <div className="etapa-modal-content">
                        <h3 className="etapa-modal-title">
                            {isEditMode ? "Editar Etapa" : "Crear Nueva Etapa"}
                        </h3>
                        <label className="etapa-label">Título:</label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            className="etapa-input"
                            placeholder="Ingrese el título de la etapa"
                        />
                        <label className="etapa-label">Descripción:</label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="etapa-textarea"
                            placeholder="Descripción de la etapa"
                        ></textarea>
                        <label className="etapa-label">
                            Puntuación (0-100):
                        </label>
                        <input
                            type="number"
                            value={puntuacion}
                            onChange={(e) => setPuntuacion(e.target.value)}
                            className="etapa-input"
                            min="0"
                            max="100"
                            placeholder="Puntuación de la etapa"
                        />
                        <label className="etapa-label">
                            Duración (semanas):
                        </label>
                        <input
                            type="number"
                            value={duracion}
                            onChange={(e) => setDuracion(e.target.value)}
                            className="etapa-input"
                            min="1"
                            placeholder="Duración en semanas"
                        />
                        <div className="modal-actions">
                            <button
                                onClick={closeEtapaModal}
                                className="cancel-btn"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEtapa}
                                className="create-btn"
                            >
                                {isEditMode ? "Guardar" : "Agregar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Etapas;
