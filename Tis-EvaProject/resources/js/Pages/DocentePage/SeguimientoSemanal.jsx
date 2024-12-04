import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import SidebarPrueba from "../../Components/ComponenteSidebar/SidebarPrueba";
import ReactQuill from "react-quill"; // Importamos ReactQuill
import "react-quill/dist/quill.snow.css"; // Estilos de ReactQuill
import "../../../css/EstilosHeader/HeaderProyecto.css";
import "../../../css/EstilosSidebar/SidebarPrueba.css";
import "../../../css/EstilosDocente/SeguimientoSemanal.css";
import axios from "axios";

const SeguimientoSemanal = () => {
    const { projectId } = useParams();
    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [projectGroups, setProjectGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [revisionDate, setRevisionDate] = useState("");
    const [currentReview, setCurrentReview] = useState("");
    const [nextReview, setNextReview] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [seguimientos, setSeguimientos] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const formatDateLong = (date) => {
        if (!date) return "";

        const localDate = new Date(date);
        const correctedDate = new Date(
            localDate.getTime() + localDate.getTimezoneOffset() * 60000
        );

        return new Intl.DateTimeFormat("es-BO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(correctedDate);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectResponse, groupsResponse] = await Promise.all([
                    axios.get(
                        `http://localhost:8000/api/proyectos/${projectId}`,
                        { withCredentials: true }
                    ),
                    axios.get(
                        `http://localhost:8000/api/proyectos/${projectId}/grupos`,
                        { withCredentials: true }
                    ),
                ]);
                setProjectDetails(projectResponse.data);
                setProjectGroups(groupsResponse.data.groups || []);
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            }
        };

        fetchData();
    }, [projectId]);

    const fetchSeguimientos = async () => {
        if (!selectedGroup) return;

        try {
            const response = await axios.get(
                `http://localhost:8000/api/seguimiento-semanal/${projectId}/${selectedGroup}`,
                { withCredentials: true }
            );
            setSeguimientos(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error al cargar los seguimientos:", error);
        }
    };

    useEffect(() => {
        fetchSeguimientos();
    }, [selectedGroup]);

    const handleGroupSelection = (event) => {
        setSelectedGroup(event.target.value);
        setSeguimientos([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedGroup) {
            setErrorMessage(
                "Por favor, selecciona un grupo antes de guardar el seguimiento."
            );
            setTimeout(() => setErrorMessage(""), 5000);
            return;
        }

        try {
            await axios.post(
                `http://localhost:8000/api/seguimiento-semanal`,
                {
                    ID_PROYECTO: projectId,
                    ID_GRUPO: selectedGroup,
                    FECHA_REVISION: revisionDate,
                    REVISO_ACTUAL: currentReview,
                    REVISARA_SIGUIENTE: nextReview,
                },
                { withCredentials: true }
            );
            setSuccessMessage("Seguimiento semanal guardado exitosamente.");
            setErrorMessage("");
            setRevisionDate("");
            setCurrentReview("");
            setNextReview("");
            fetchSeguimientos();

            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (error) {
            console.error("Error al guardar el seguimiento:", error);
            setErrorMessage("Hubo un error al guardar el seguimiento.");
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    const handleEdit = (seguimiento) => {
        setEditingId(seguimiento.ID_SEGUIMIENTO);
        setRevisionDate(seguimiento.FECHA_REVISION);
        setCurrentReview(seguimiento.REVISO_ACTUAL);
        setNextReview(seguimiento.REVISARA_SIGUIENTE);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            await axios.put(
                `http://localhost:8000/api/seguimiento-semanal/${editingId}`,
                {
                    FECHA_REVISION: revisionDate,
                    REVISO_ACTUAL: currentReview,
                    REVISARA_SIGUIENTE: nextReview,
                },
                { withCredentials: true }
            );
            setSuccessMessage("Seguimiento actualizado exitosamente.");
            setErrorMessage("");
            setRevisionDate("");
            setCurrentReview("");
            setNextReview("");
            setEditingId(null);
            fetchSeguimientos();

            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (error) {
            console.error("Error al actualizar el seguimiento:", error);
            setErrorMessage("Hubo un error al actualizar el seguimiento.");
            setTimeout(() => setErrorMessage(""), 5000);
        }
    };

    return (
        <div
            className={`seguimiento-semanal-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderProyecto />
            <div className="seguimiento-semanal-sidebar-content">
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                />
                <div className="container">
                    <div className="projects-header">
                        <h2>Seguimiento Semanal</h2>
                    </div>
                    <div className="dropdown-container">
                        <label htmlFor="groupDropdown">
                            Selecciona un grupo:
                        </label>
                        <select
                            id="groupDropdown"
                            value={selectedGroup || ""}
                            onChange={handleGroupSelection}
                        >
                            <option value="" disabled>
                                Seleccionar grupo
                            </option>
                            {projectGroups.length > 0 ? (
                                projectGroups.map((group) => (
                                    <option
                                        key={group.ID_GRUPO}
                                        value={group.ID_GRUPO}
                                    >
                                        {group.NOMBRE_GRUPO}
                                    </option>
                                ))
                            ) : (
                                <option disabled>
                                    No hay grupos disponibles
                                </option>
                            )}
                        </select>
                    </div>
                    {selectedGroup ? (
                        <form
                            onSubmit={editingId ? handleUpdate : handleSubmit}
                            className="seguimiento-form"
                        >
                            <div className="form-group">
                                <label htmlFor="revisionDate">
                                    Fecha de revisión:
                                </label>
                                <input
                                    type="date"
                                    id="revisionDate"
                                    value={revisionDate}
                                    onChange={(e) =>
                                        setRevisionDate(e.target.value)
                                    }
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>¿Qué se revisó esta fecha?</label>
                                <ReactQuill
                                    value={currentReview}
                                    onChange={setCurrentReview}
                                    theme="snow"
                                />
                            </div>
                            <div className="form-group">
                                <label>¿Qué se revisará la próxima vez?</label>
                                <ReactQuill
                                    value={nextReview}
                                    onChange={setNextReview}
                                    theme="snow"
                                />
                            </div>
                            <button type="submit" className="save-button">
                                {editingId
                                    ? "Actualizar Seguimiento"
                                    : "Guardar Seguimiento"}
                            </button>
                        </form>
                    ) : (
                        <p className="no-data-message">
                            Seleccione un grupo para crear un seguimiento.
                        </p>
                    )}
                    <div className="seguimientos-list">
                        {Array.isArray(seguimientos) &&
                        seguimientos.length > 0 ? (
                            seguimientos.map((seguimiento) => (
                                <div
                                    key={seguimiento.ID_SEGUIMIENTO}
                                    className="seguimiento-card"
                                >
                                    <h4 className="seguimiento-card-title">
                                        Fecha:{" "}
                                        {formatDateLong(
                                            seguimiento.FECHA_REVISION
                                        )}
                                    </h4>
                                    <div className="seguimiento-card-content">
                                        <div className="seguimiento-section">
                                            <h5 className="section-title">
                                                Revisado:
                                            </h5>
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: seguimiento.REVISO_ACTUAL,
                                                }}
                                                className="section-content"
                                            ></div>
                                        </div>
                                        <div className="seguimiento-section">
                                            <h5 className="section-title">
                                                Por revisar:
                                            </h5>
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: seguimiento.REVISARA_SIGUIENTE,
                                                }}
                                                className="section-content"
                                            ></div>
                                        </div>
                                    </div>
                                    <button
                                        className="edit-button"
                                        onClick={() => handleEdit(seguimiento)}
                                    >
                                        Editar
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="no-data-message">
                                No hay seguimientos registrados para este grupo.
                            </p>
                        )}
                    </div>
                    {successMessage && (
                        <p className="success-messages">{successMessage}</p>
                    )}
                    {errorMessage && (
                        <p className="error-messages">{errorMessage}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeguimientoSemanal;
