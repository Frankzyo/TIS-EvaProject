import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import SidebarPrueba from "../../Components/ComponenteSidebar/SidebarPrueba";
import "../../../css/EstilosProyecto/Proyectos.css";
import "../../../css/EstilosGrupo/Grupos.css";
import "../../../css/EstilosHeader/HeaderProyecto.css";
import "../../../css/EstilosSidebar/SidebarPrueba.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ModalConfirmacion from "../../Components/ComponenteModal/ModalConfirmacion";
import ModalMensajeExito from "../../Components/ComponenteModal/ModalMensajeExito";
import ModalError from "../../Components/ComponenteModal/ModalError";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const RequerimientosDocente = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCreateSuccessMessage, setShowCreateSuccessMessage] =
        useState(false);
    const [showEditSuccessMessage, setShowEditSuccessMessage] = useState(false);
    const [showDeleteSuccessMessage, setShowDeleteSuccessMessage] =
        useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [errorMessage, setErrorMessage] = useState({});
    const isModalOpen =
        showConfirmModal ||
        showCreateSuccessMessage ||
        showEditSuccessMessage ||
        showDeleteSuccessMessage ||
        showErrorMessage;
    const [requirements, setRequirements] = useState([]);
    const [projectDetails, setProjectDetails] = useState({});
    const [editedDescription, setEditedDescription] = useState("");
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [requirementToDelete, setRequirementToDelete] = useState(null);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    useEffect(() => {
        fetch(`http://localhost:8000/api/proyectos/${projectId}`)
            .then((response) => response.json())
            .then((data) => setProjectDetails(data))
            .catch((error) =>
                console.error("Error al cargar el proyecto:", error)
            );
    }, [projectId]);

    useEffect(() => {
        fetchRequirements();
    }, []);

    const fetchRequirements = () => {
        fetch(`http://localhost:8000/api/proyectos/${projectId}/requerimientos`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                const allRequirements = [
                    ...(data.requerimientosProyecto || []),
                    ...(data.requerimientosGrupo || []),
                ];
                setRequirements(allRequirements);
            })
            .catch((error) =>
                console.error("Error al cargar los requerimientos:", error)
            );
    };

    const handleAddRequirement = () => {
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");
        const newRequirement = {
            ID_PROYECTO: projectId,
            DESCRIPCION_REQ: "Descripción del nuevo requerimiento",
        };

        fetch("http://localhost:8000/api/requerimientos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify(newRequirement),
        })
            .then((response) => response.json())
            .then((data) => {
                setRequirements([...requirements, data]);
                setShowCreateSuccessMessage(true);
            })
            .catch((error) => {
                console.error("Error al agregar requerimiento:", error);
                setErrorMessage(
                    "Hubo un problema al agregar el requerimiento."
                );
                setShowErrorMessage(true);
            });
    };

    const toggleEditRequirement = (
        index,
        isEditing,
        currentDescription = ""
    ) => {
        setRequirements((prevRequirements) =>
            prevRequirements.map((req, i) =>
                i === index ? { ...req, isEditing: isEditing } : req
            )
        );
        setEditedDescription(isEditing ? currentDescription : "");
    };

    const openConfirmDeleteModal = (requirementId) => {
        setRequirementToDelete(requirementId);
        setShowConfirmModal(true);
    };

    const handleDeleteRequirement = () => {
        if (!requirementToDelete) return;

        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");

        fetch(
            `http://localhost:8000/api/requerimientos/${requirementToDelete}`,
            {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                },
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error al eliminar el requerimiento");
                }
                return response.json();
            })
            .then(() => {
                setRequirements((prevRequirements) =>
                    prevRequirements.filter(
                        (req) => req.ID_REQUERIMIENTO !== requirementToDelete
                    )
                );
                setRequirementToDelete(null);
                setShowDeleteSuccessMessage(true);
                setShowConfirmModal(false);
            })
            .catch((error) => {
                console.error("Error al eliminar el requerimiento:", error);
                setErrorMessage(
                    "Hubo un problema al eliminar el requerimiento."
                );
                setShowErrorMessage(true);
            });
    };

    const handleSaveRequirement = (requirement) => {
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");

        fetch(
            `http://localhost:8000/api/requerimientos/${requirement.ID_REQUERIMIENTO}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({ DESCRIPCION_REQ: editedDescription }),
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error al actualizar el requerimiento");
                }
                return response.json();
            })
            .then((data) => {
                setRequirements((prevRequirements) =>
                    prevRequirements.map((req) =>
                        req.ID_REQUERIMIENTO === data.ID_REQUERIMIENTO
                            ? {
                                  ...req,
                                  DESCRIPCION_REQ: data.DESCRIPCION_REQ,
                                  isEditing: false,
                              }
                            : req
                    )
                );
                setEditedDescription("");
                setShowEditSuccessMessage(true);
            })
            .catch((error) => {
                console.error("Error al actualizar el requerimiento:", error);
                setErrorMessage(
                    "Hubo un problema al actualizar el requerimiento."
                );
                setShowErrorMessage(true);
            });
    };

    return (
        <div
            className={`grupos-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderProyecto isModalOpen={isModalOpen} />

            <div className="grupos-sidebar-content">
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                />

                <div className={`container ${isModalOpen ? "disabled" : ""}`}>
                    <div className="projects-header">
                        <h2>Requerimientos</h2>
                        <button
                            className="new-project-btn"
                            onClick={handleAddRequirement}
                            disabled={isModalOpen}
                        >
                            <i className="fas fa-plus"></i> Nuevo requerimiento
                        </button>
                    </div>

                    <div className="project-list requerimientos-list">
                        {requirements.map((requirement, index) => (
                            <div
                                key={requirement.ID_REQUERIMIENTO}
                                className="project-item requerimientos-list"
                            >
                                {requirement.isEditing ? (
                                    <ReactQuill
                                        theme="snow"
                                        value={
                                            editedDescription ||
                                            requirement.DESCRIPCION_REQ
                                        }
                                        onChange={(value) =>
                                            setEditedDescription(value)
                                        }
                                        className="requirement-quill-editor"
                                        placeholder="Descripción del requerimiento"
                                        style={{ width: "100%" }}
                                    />
                                ) : (
                                    <div className="project-info requerimientos-list">
                                        <div className="requirement-text-container">
                                            <span
                                                className="requirement-description"
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        requirement.DESCRIPCION_REQ ||
                                                        "Descripción del requerimiento",
                                                }}
                                            ></span>
                                        </div>
                                    </div>
                                )}
                                <div className="project-actions requerimientos-list">
                                    <button
                                        className="action-btn"
                                        onClick={() =>
                                            requirement.isEditing
                                                ? handleSaveRequirement(
                                                      requirement
                                                  )
                                                : toggleEditRequirement(
                                                      index,
                                                      true,
                                                      requirement.DESCRIPCION_REQ
                                                  )
                                        }
                                    >
                                        <i
                                            className={
                                                requirement.isEditing
                                                    ? "fas fa-save"
                                                    : "fas fa-pen"
                                            }
                                        ></i>
                                    </button>
                                    <button
                                        className="action-btn"
                                        onClick={() =>
                                            openConfirmDeleteModal(
                                                requirement.ID_REQUERIMIENTO
                                            )
                                        }
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showConfirmModal && (
                <ModalConfirmacion
                    show={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleDeleteRequirement}
                    title="Confirmar eliminación"
                    message="¿Está seguro de que desea eliminar este requerimiento?"
                />
            )}
            {showCreateSuccessMessage && (
                <ModalMensajeExito
                    message="¡Requerimiento creado exitosamente!"
                    onClose={() => setShowCreateSuccessMessage(false)}
                />
            )}
            {showEditSuccessMessage && (
                <ModalMensajeExito
                    message="¡Requerimiento editado exitosamente!"
                    onClose={() => setShowEditSuccessMessage(false)}
                />
            )}
            {showDeleteSuccessMessage && (
                <ModalMensajeExito
                    message="¡Requerimiento eliminado exitosamente!"
                    onClose={() => setShowDeleteSuccessMessage(false)}
                />
            )}
            {showErrorMessage && (
                <ModalError
                    errorMessage={errorMessage}
                    closeModal={() => setShowErrorMessage(false)}
                />
            )}
        </div>
    );
};

export default RequerimientosDocente;
