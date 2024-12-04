import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEstudiante from "../../Components/ComponenteSidebar/SidebarEstudiante";
import HeaderEstudiante from "../../Components/ComponenteHeader/HeaderEstudiante";
import useProjectAndGroupId from "../../Components/useProjectAndGroupId";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../../css/EstilosDocente/SeguimientoSemanal.css";
import "../../../css/EstilosSidebar/SidebarEstudiante.css";

const SeguimientoSemanalEstudiante = () => {
    const navigate = useNavigate();
    const [proyecto, setProyecto] = useState(null);
    const [grupo, setGrupo] = useState(null);
    const { projectId, groupId } = useProjectAndGroupId();
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isRepresentanteLegal, setIsRepresentanteLegal] = useState(false);
    const [seguimientos, setSeguimientos] = useState([]);
    const [revisionDate, setRevisionDate] = useState("");
    const [currentReview, setCurrentReview] = useState("");
    const [nextReview, setNextReview] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    useEffect(() => {
        const role = localStorage.getItem("ROLE");
        const estudianteId = localStorage.getItem("ID_EST");
        const representanteLegal = localStorage.getItem("IS_RL");

        if (role !== "Estudiante" || !estudianteId) {
            navigate("/login");
        }

        setIsRepresentanteLegal(representanteLegal === "true");
    }, [navigate]);

    useEffect(() => {
        const obtenerDatosEstudiante = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/estudiante/proyecto-grupo",
                    { withCredentials: true }
                );

                if (response.data) {
                    setProyecto(response.data.proyecto);
                    setGrupo(response.data.grupo);
                    fetchSeguimientos(
                        response.data.proyecto.ID_PROYECTO,
                        response.data.grupo.ID_GRUPO
                    );
                }
            } catch (error) {
                console.error(
                    "Error al cargar los datos del estudiante:",
                    error
                );
            }
        };

        obtenerDatosEstudiante();
    }, []);

    const fetchSeguimientos = async (projectId, groupId) => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/seguimiento-semanal/${projectId}/${groupId}`,
                { withCredentials: true }
            );
            setSeguimientos(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error al cargar los seguimientos:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                `http://localhost:8000/api/seguimiento-semanal`,
                {
                    ID_PROYECTO: proyecto.ID_PROYECTO,
                    ID_GRUPO: grupo.ID_GRUPO,
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
            setEditingId(null);
            fetchSeguimientos(proyecto.ID_PROYECTO, grupo.ID_GRUPO);

            setTimeout(() => {
                setSuccessMessage("");
            }, 5000);
        } catch (error) {
            console.error("Error al guardar el seguimiento:", error);
            setErrorMessage("Hubo un error al guardar el seguimiento.");
            setSuccessMessage("");

            setTimeout(() => {
                setErrorMessage("");
            }, 5000);
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
            fetchSeguimientos(proyecto.ID_PROYECTO, grupo.ID_GRUPO);

            setTimeout(() => {
                setSuccessMessage("");
            }, 5000);
        } catch (error) {
            console.error("Error al actualizar el seguimiento:", error);
            setErrorMessage("Hubo un error al actualizar el seguimiento.");
            setSuccessMessage("");

            setTimeout(() => {
                setErrorMessage("");
            }, 5000);
        }
    };

    return (
        <div
            className={`seguimiento-semanal-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderEstudiante />
            <div className="seguimiento-semanal-sidebar-content">
                <SidebarEstudiante
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={proyecto?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${proyecto?.PORTADA_PROYECTO}`}
                    isRepresentanteLegal={isRepresentanteLegal}
                    projectId={projectId}
                    groupId={groupId}
                />
                <div className="container">
                    <div className="projects-header">
                        <h2>Seguimiento Semanal</h2>
                    </div>
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
                            <label htmlFor="currentReview">
                                ¿Qué se revisó esta fecha?
                            </label>
                            <ReactQuill
                                theme="snow"
                                value={currentReview}
                                onChange={setCurrentReview}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="nextReview">
                                ¿Qué se revisará la próxima vez?
                            </label>
                            <ReactQuill
                                theme="snow"
                                value={nextReview}
                                onChange={setNextReview}
                            />
                        </div>
                        <button type="submit" className="save-button">
                            {editingId
                                ? "Actualizar Seguimiento"
                                : "Guardar Seguimiento"}
                        </button>
                    </form>
                    <div className="seguimientos-list">
                        {seguimientos.length > 0 ? (
                            seguimientos.map((seguimiento) => (
                                <div
                                    key={seguimiento.ID_SEGUIMIENTO}
                                    className="seguimiento-card"
                                >
                                    <h4 className="seguimiento-card-title">
                                        Fecha:{" "}
                                        {new Date(
                                            seguimiento.FECHA_REVISION
                                        ).toLocaleDateString("es-BO")}
                                    </h4>
                                    <div className="seguimiento-card-content">
                                        <div className="seguimiento-section">
                                            <h5>Revisado:</h5>
                                            <div
                                                className="section-content"
                                                dangerouslySetInnerHTML={{
                                                    __html: seguimiento.REVISO_ACTUAL,
                                                }}
                                            ></div>
                                        </div>
                                        <div className="seguimiento-section">
                                            <h5>Por revisar:</h5>
                                            <div
                                                className="section-content"
                                                dangerouslySetInnerHTML={{
                                                    __html: seguimiento.REVISARA_SIGUIENTE,
                                                }}
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
                                No hay seguimientos registrados.
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

export default SeguimientoSemanalEstudiante;
