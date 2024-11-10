import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderProyecto from "../Components/HeaderProyecto";
import "../../css/Proyectos.css";
import "../../css/HeaderProyecto.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ModalConfirmacion from "../Components/ModalConfirmacion";
import ModalMensajeExito from "../Components/ModalMensajeExito";
import ModalError from "../Components/ModalError";

const Proyectos = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCreateSuccessMessage, setShowCreateSuccessMessage] =
        useState(false);
    const [showEditSuccessMessage, setShowEditSuccessMessage] = useState(false);
    const [showDeleteSuccessMessage, setShowDeleteSuccessMessage] =
        useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false); // Estado para el mensaje de error
    const [errorMessage, setErrorMessage] = useState(""); // Estado para el texto del mensaje de error
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [projects, setProjects] = useState([]);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [projectToEdit, setProjectToEdit] = useState(null); // Estado para el proyecto a editar
    const [isEditing, setIsEditing] = useState(false);
    const docenteId = localStorage.getItem("ID_DOCENTE");

    const [image, setImage] = useState(null); // Estado para la imagen seleccionada
    const navigateDocente = useNavigate();
    const hadleRedirectDocente = (idProject) => {
        navigateDocente(`/home-docente/${idProject}`);
    };
    const isModalOpen =
        showModal ||
        showConfirmModal ||
        showCreateSuccessMessage ||
        showEditSuccessMessage ||
        showDeleteSuccessMessage ||
        showErrorMessage;

    useEffect(() => {
        const docenteId = localStorage.getItem("ID_DOCENTE");
        const role = localStorage.getItem("ROLE");

        if (!docenteId || role !== "Docente") {
            // Si no hay un docente logueado, redirige al login
            navigate("/login");
        }
    }, [navigate]);
    // Obtener lista de proyectos al cargar el componente
    useEffect(() => {
        fetch("http://localhost:8000/api/proyectos", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        "Error en la solicitud: " + response.status
                    );
                }
                return response.json();
            })
            .then((data) => {
                console.log("Proyectos recibidos:", data); // Imprime los datos en la consola para verificar
                setProjects(data);
            })
            .catch((error) => console.error("Error fetching projects:", error));
    }, []);

    // Función para guardar o editar un proyecto
    const handleSaveProject = () => {
        if (!projectName || !projectDescription) {
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
        formData.append("NOMBRE_PROYECTO", projectName);
        formData.append("DESCRIP_PROYECTO", projectDescription);
        formData.append("FECHA_INICIO_PROYECTO", "2024-01-01");
        formData.append("FECHA_FIN_PROYECTO", "2024-12-31");
        formData.append("ID_DOCENTE", docenteId);

        if (image) {
            formData.append("PORTADA_PROYECTO", image);
        }

        if (isEditing) {
            formData.append("_method", "PUT"); // Forzar el método PUT mediante el campo _method
        }

        const url = isEditing
            ? `http://localhost:8000/api/proyectos/${projectToEdit.ID_PROYECTO}`
            : "http://localhost:8000/api/proyectos";

        fetch(url, {
            method: "POST", // Usamos POST en lugar de PUT
            headers: {
                "X-CSRF-TOKEN": csrfToken,
            },
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        "Error al guardar el proyecto: " + response.statusText
                    );
                }
                return response.json();
            })
            .then((data) => {
                const updatedProjects = isEditing
                    ? projects.map((project) =>
                          project.ID_PROYECTO === projectToEdit.ID_PROYECTO
                              ? data
                              : project
                      )
                    : [...projects, data];
                setProjects(updatedProjects);
                setShowModal(false);
                setShowCreateSuccessMessage(!isEditing);
                setShowEditSuccessMessage(isEditing);
            })
            .catch((error) => {
                console.error("Error al guardar el proyecto:", error);
                setErrorMessage(
                    "Hubo un problema al guardar el proyecto. Intente nuevamente."
                );
                setShowErrorMessage(true);
            });
    };

    const handleOpenEditModal = (index) => {
        const project = projects[index];
        setProjectName(project.NOMBRE_PROYECTO);
        setProjectDescription(project.DESCRIP_PROYECTO);
        setProjectToEdit(project); // Guarda todo el proyecto, no solo el ID
        setImage(null); // Asegúrate de limpiar la imagen seleccionada previamente
        setIsEditing(true);
        setShowModal(true);
    };

    const handleOpenConfirmModal = (index) => {
        setProjectToDelete(index);
        setShowConfirmModal(true);
    };

    const handleDeleteProject = () => {
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");
        fetch(
            `http://localhost:8000/api/proyectos/${projects[projectToDelete].ID_PROYECTO}`,
            {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                },
            }
        )
            .then(() => {
                const updatedProjects = projects.filter(
                    (_, index) => index !== projectToDelete
                );
                setProjects(updatedProjects);
                setShowConfirmModal(false);
                setProjectToDelete(null);
                setShowDeleteSuccessMessage(true);
            })
            .catch((error) => console.error("Error deleting project:", error));
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
        if (isEditing && projectToEdit && projectToEdit.PORTADA_PROYECTO) {
            return `http://localhost:8000/storage/${projectToEdit.PORTADA_PROYECTO}`; // Muestra la imagen existente
        }
        return null;
    };

    return (
        <div>
            <HeaderProyecto isModalOpen={isModalOpen} />

            <div className={`container ${isModalOpen ? "disabled" : ""}`}>
                <div className="projects-header">
                    <h2>Proyectos</h2>
                    <button
                        className="new-project-btn"
                        onClick={() => {
                            setIsEditing(false);
                            setShowModal(true);
                            setProjectName("");
                            setProjectDescription("");
                            setImage(null);
                        }}
                        disabled={isModalOpen}
                    >
                        <i className="fas fa-plus"></i> Nuevo proyecto
                    </button>
                </div>

                <div className="project-list">
                    {projects.map((project, index) => (
                        <div key={index} className="project-item">
                            {project.PORTADA_PROYECTO ? (
                                <img
                                    src={`http://localhost:8000/storage/${project.PORTADA_PROYECTO}`}
                                    alt="Icono del proyecto"
                                    width="50"
                                    height="50"
                                    onClick={() =>
                                        hadleRedirectDocente(
                                            project.ID_PROYECTO
                                        )
                                    }
                                />
                            ) : (
                                <img
                                    src="https://via.placeholder.com/50"
                                    alt="Icono del proyecto"
                                />
                            )}
                            <div className="project-info">
                                <h3
                                    onClick={() =>
                                        navigate(
                                            `/grupos/${project.ID_PROYECTO}`
                                        )
                                    }
                                    style={{ cursor: "pointer" }}
                                >
                                    {project.NOMBRE_PROYECTO}
                                </h3>

                                <p>{project.DESCRIP_PROYECTO}</p>
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
                                        handleOpenConfirmModal(index)
                                    }
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal para crear/editar proyectos */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>
                            {isEditing
                                ? "Editar Proyecto"
                                : "Detalles del Proyecto"}
                        </h3>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Nombre del Proyecto*"
                            className="input-field"
                        />
                        <div className="description-and-photo">
                            <textarea
                                value={projectDescription}
                                onChange={(e) =>
                                    setProjectDescription(e.target.value)
                                }
                                placeholder="Descripción del proyecto*"
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
                                onClick={handleSaveProject}
                                className="create-btn"
                            >
                                {isEditing
                                    ? "Guardar cambios"
                                    : "Crear proyecto"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            {showConfirmModal && (
                <ModalConfirmacion
                    show={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleDeleteProject}
                    title="Confirmar eliminación"
                    message="¿Está seguro de que desea eliminar este proyecto?"
                />
            )}

            {/* Mensaje de éxito para creación */}
            {showCreateSuccessMessage && (
                <ModalMensajeExito
                    message="¡Se creo el proyecto exitosamente!"
                    onClose={() => setShowCreateSuccessMessage(false)}
                />
            )}
            {/* Mensaje de éxito para edición */}
            {showEditSuccessMessage && (
                <ModalMensajeExito
                    message="¡Se guardaron los cambios exitosamente!"
                    onClose={() => setShowEditSuccessMessage(false)}
                />
            )}

            {/* Mensaje de éxito para eliminación */}
            {showDeleteSuccessMessage && (
                <ModalMensajeExito
                    message="¡Se eliminó el proyecto correctamente!"
                    onClose={() => setShowDeleteSuccessMessage(false)}
                />
            )}

            {/* Modal de error */}
            {showErrorMessage && (
                <ModalError
                    errorMessage="Por favor, complete los campos de titulo y descripción."
                    closeModal={() => setShowErrorMessage(false)}
                />
            )}
        </div>
    );
};

export default Proyectos;
