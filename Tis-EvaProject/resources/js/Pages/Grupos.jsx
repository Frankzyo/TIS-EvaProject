import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderProyecto from "../Components/HeaderProyecto";
import SidebarPrueba from "../Components/SidebarPrueba";
import "../../css/Proyectos.css"; // Reutiliza el CSS de Proyectos
import "../../css/Grupos.css"; // Reutiliza el CSS de Proyectos
import "../../css/HeaderProyecto.css";
import "../../css/SidebarPrueba.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ModalConfirmacion from "../Components/ModalConfirmacion";
import ModalMensajeExito from "../Components/ModalMensajeExito";
import ModalError from "../Components/ModalError";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const Grupos = ({ projectId }) => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCreateSuccessMessage, setShowCreateSuccessMessage] =
        useState(false);
    const [showEditSuccessMessage, setShowEditSuccessMessage] = useState(false);
    const [showDeleteSuccessMessage, setShowDeleteSuccessMessage] =
        useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [groups, setGroups] = useState([]);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [groupToEdit, setGroupToEdit] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [image, setImage] = useState(null);
    const [errorMessage, setErrorMessage] = useState({});
    const isModalOpen =
        showModal ||
        showConfirmModal ||
        showCreateSuccessMessage ||
        showEditSuccessMessage ||
        showDeleteSuccessMessage ||
        showErrorMessage;
    const [requirements, setRequirements] = useState([]);
    const [projectDetails, setProjectDetails] = useState({});
    const [editedDescription, setEditedDescription] = useState("");
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);
    useEffect(() => {
        // Lógica para cargar los detalles del proyecto
        fetch(`http://localhost:8000/api/proyectos/${projectId}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Detalles del proyecto:", data);
                setProjectDetails(data); // Almacena los detalles en el estado
            })
            .catch((error) =>
                console.error("Error al cargar el proyecto:", error)
            );
    }, [projectId]);

    useEffect(() => {
        fetch(`http://localhost:8000/api/proyectos/${projectId}/grupos`)
            .then((response) => response.json())
            .then((data) => setGroups(data))
            .catch((error) =>
                console.error("Error al cargar los grupos:", error)
            );
    }, [projectId]);
    useEffect(() => {
        fetch(`http://localhost:8000/api/proyectos/${projectId}/requerimientos`)
            .then((response) => response.json())
            .then((data) => setRequirements(data))
            .catch((error) =>
                console.error("Error al cargar los requerimientos:", error)
            );
    }, [projectId]);

    useEffect(() => {
        const docenteId = localStorage.getItem("ID_DOCENTE");
        const role = localStorage.getItem("ROLE");

        if (!docenteId || role !== "Docente") {
            // Si no hay un docente logueado, redirige al login
            navigate("/login");
        }
    }, [navigate]);

    const handleSaveGroup = () => {
        if (!groupName || !groupDescription) {
            setErrorMessage(
                "Por favor, complete todos los campos obligatorios."
            );
            setShowErrorMessage(true);
            return;
        }

        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        const formData = new FormData();
        formData.append("NOMBRE_GRUPO", groupName);
        formData.append("DESCRIP_GRUPO", groupDescription);
        formData.append("ID_PROYECTO", projectId);

        if (image) {
            formData.append("PORTADA_GRUPO", image);
        }

        // Forzar el método PUT mediante el campo _method si está en modo edición
        if (isEditing) {
            formData.append("_method", "PUT");
        }

        const url = isEditing
            ? `http://localhost:8000/api/grupos/${groupToEdit.ID_GRUPO}`
            : "http://localhost:8000/api/grupos";

        fetch(url, {
            method: "POST", // Usamos POST en lugar de PUT
            headers: {
                "X-CSRF-TOKEN": csrfToken,
                Accept: "application/json", // Asegura que Laravel responda en JSON
            },
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        throw new Error(
                            errorData.message || "Error al guardar el grupo"
                        );
                    });
                }
                return response.json();
            })
            .then((data) => {
                const updatedGroups = isEditing
                    ? groups.map((group) =>
                          group.ID_GRUPO === groupToEdit.ID_GRUPO ? data : group
                      )
                    : [...groups, data];

                setGroups(updatedGroups);
                setShowModal(false);
                setShowCreateSuccessMessage(!isEditing);
                setShowEditSuccessMessage(isEditing);
            })
            .catch((error) => {
                console.error("Error al guardar el grupo:", error);
                setErrorMessage(
                    "Hubo un problema al guardar el grupo. Intente nuevamente."
                );
                setShowErrorMessage(true);
            });
    };

    const handleOpenEditModal = (index) => {
        const group = groups[index];
        setGroupName(group.NOMBRE_GRUPO || ""); // Asegura que se establezca el nombre
        setGroupDescription(group.DESCRIP_GRUPO || "");
        setGroupToEdit(group);
        setImage(null);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleOpenConfirmModal = (id) => {
        setGroupToDelete(id); // Ahora estableces el ID del grupo, no el índice
        setShowConfirmModal(true); // Muestra el modal de confirmación
    };

    const handleDeleteGroup = () => {
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");

        fetch(`http://localhost:8000/api/grupos/${groupToDelete}`, {
            method: "DELETE",
            headers: {
                "X-CSRF-TOKEN": csrfToken,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error al eliminar el grupo");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Grupo eliminado:", data);
                // Actualizar la lista de grupos en el frontend después de la eliminación
                const updatedGroups = groups.filter(
                    (group) => group.ID_GRUPO !== groupToDelete
                );
                setGroups(updatedGroups);
                setShowConfirmModal(false);
                setGroupToDelete(null);
                setShowDeleteSuccessMessage(true);
            })
            .catch((error) => {
                console.error("Error al eliminar el grupo:", error);
            });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const validTypes = ["image/jpeg", "image/png", "image/jpg"];

        if (file && validTypes.includes(file.type)) {
            setImage(file);
        } else {
            alert(
                "Solo se permiten archivos de imagen en formato JPG, JPEG o PNG."
            );
        }
    };

    const getImagePreview = () => {
        if (image) {
            return URL.createObjectURL(image); // Muestra la imagen seleccionada en el modal
        }
        if (isEditing && groupToEdit && groupToEdit.PORTADA_GRUPO) {
            return `http://localhost:8000/storage/${groupToEdit.PORTADA_GRUPO}`; // Muestra la imagen existente desde el servidor
        }
        return null;
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
                setRequirements([...requirements, data]); // Actualiza la lista con el nuevo requerimiento
            })
            .catch((error) => {
                console.error("Error al agregar requerimiento:", error);
            });
    };

    const fetchRequirements = () => {
        fetch(`http://localhost:8000/api/proyectos/${projectId}/requerimientos`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Requerimientos recibidos desde la API:", data);

                // Combina requerimientosProyecto y requerimientosGrupo en un solo array
                const allRequirements = [
                    ...(data.requerimientosProyecto || []),
                    ...(data.requerimientosGrupo || []),
                ];

                setRequirements(allRequirements); // Asigna el array combinado al estado
            })
            .catch((error) => {
                console.error("Error al cargar los requerimientos:", error);
            });
    };

    useEffect(() => {
        fetchRequirements();
    }, []);
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
        setEditedDescription(isEditing ? currentDescription : ""); // Inicializar con la descripción actual o limpiar
    };

    const handleDeleteRequirement = (requirementId) => {
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");

        fetch(`http://localhost:8000/api/requerimientos/${requirementId}`, {
            method: "DELETE",
            headers: {
                "X-CSRF-TOKEN": csrfToken,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error al eliminar el requerimiento");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Requerimiento eliminado:", data);
                // Actualizar la lista de requerimientos en el estado
                setRequirements((prevRequirements) =>
                    prevRequirements.filter(
                        (req) => req.ID_REQUERIMIENTO !== requirementId
                    )
                );
            })
            .catch((error) => {
                console.error("Error al eliminar el requerimiento:", error);
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
                body: JSON.stringify({
                    DESCRIPCION_REQ: editedDescription,
                }),
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
                setEditedDescription(""); // Limpiar el campo después de guardar
            })
            .catch((error) => {
                console.error("Error al actualizar el requerimiento:", error);
            });
    };

    return (
        <div className="grupos-container">
            {/* Header */}

            {/* Contenedor principal que contiene el sidebar y el contenido */}

            {/* Sidebar */}

            {/* Contenedor del contenido principal */}
            <div className={`container ${isModalOpen ? "disabled" : ""}`}>
                {/* Sección de "Mis grupos" */}
                <div className="projects-header">
                    <h2>Grupos</h2>
                    <button
                        className="new-project-btn"
                        onClick={() => {
                            setIsEditing(false);
                            setShowModal(true);
                            setGroupName("");
                            setGroupDescription("");
                            setImage(null);
                        }}
                        disabled={isModalOpen}
                    >
                        <i className="fas fa-plus"></i> Nuevo grupo
                    </button>
                </div>

                {/* Lista de grupos */}
                <div className="project-list">
                    {groups.map((group, index) => (
                        <div key={index} className="project-item">
                            {group.PORTADA_GRUPO ? (
                                <img
                                    src={`http://localhost:8000/storage/${group.PORTADA_GRUPO}`}
                                    alt="Icono del grupo"
                                    width="50"
                                    height="50"
                                />
                            ) : (
                                <img
                                    src="https://via.placeholder.com/50"
                                    alt="Icono del grupo"
                                />
                            )}

                            <div className="project-info">
                                <h3
                                    onClick={() =>
                                        navigate(
                                            `/proyectos/${projectId}/grupos/${group.ID_GRUPO}/estudiantes`
                                        )
                                    }
                                    style={{ cursor: "pointer" }}
                                >
                                    {group.NOMBRE_GRUPO}
                                </h3>
                                <p>{group.DESCRIP_GRUPO}</p>
                            </div>

                            <div className="project-actions">
                                <button
                                    className="action-btn"
                                    onClick={() => handleOpenEditModal(index)}
                                >
                                    <i className="fas fa-pen"></i>
                                </button>
                                <button
                                    className="action-btn"
                                    onClick={() =>
                                        handleOpenConfirmModal(group.ID_GRUPO)
                                    }
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sección de "Requerimientos" */}
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

                {/* Lista de requerimientos */}
                <div className="project-list requerimientos-list">
                    {Array.isArray(requirements) &&
                        requirements.map((requirement, index) => (
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
                                            handleDeleteRequirement(
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

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>
                            {isEditing ? "Editar grupo" : "Detalles del grupo"}
                        </h3>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Nombre del Grupo*"
                            className="input-field"
                        />
                        <div className="description-and-photo">
                            <textarea
                                value={groupDescription}
                                onChange={(e) =>
                                    setGroupDescription(e.target.value)
                                }
                                placeholder="Descripción del grupo*"
                                className="textarea-field"
                            />
                            <div className="upload-container">
                                <p className="upload-title">Incluya una foto</p>
                                <div
                                    className="upload-box"
                                    onClick={() =>
                                        document
                                            .getElementById("fileInput")
                                            .click()
                                    }
                                >
                                    {getImagePreview() ? (
                                        <img
                                            src={getImagePreview()}
                                            alt="Vista previa"
                                            className="image-preview"
                                        />
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt"></i>
                                            <p>
                                                Pulsa aquí para añadir archivos
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="image/jpeg, image/png, image/jpg"
                                    style={{ display: "none" }}
                                    onChange={handleImageChange}
                                />
                                {image && <p>{image.name}</p>}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                onClick={() => setShowModal(false)}
                                className="cancel-btn"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveGroup}
                                className="create-btn"
                            >
                                {isEditing ? "Guardar cambios" : "Crear grupo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <ModalConfirmacion
                    show={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleDeleteGroup}
                    title="Confirmar eliminación"
                    message="¿Está seguro de que desea eliminar este grupo?"
                />
            )}
            {showCreateSuccessMessage && (
                <ModalMensajeExito
                    message="¡Se creo el grupo exitosamente!"
                    onClose={() => setShowCreateSuccessMessage(false)}
                />
            )}
            {showEditSuccessMessage && (
                <ModalMensajeExito
                    message="¡Se guardaron los cambios exitosamente!"
                    onClose={() => setShowEditSuccessMessage(false)}
                />
            )}
            {showDeleteSuccessMessage && (
                <ModalMensajeExito
                    message="¡Se eliminó el grupo correctamente!"
                    onClose={() => setShowDeleteSuccessMessage(false)}
                />
            )}
            {showErrorMessage && (
                <ModalError
                    errorMessage="Por favor, complete los campos de título y descripción."
                    closeModal={() => setShowErrorMessage(false)}
                />
            )}
        </div>
    );
};

export default Grupos;
