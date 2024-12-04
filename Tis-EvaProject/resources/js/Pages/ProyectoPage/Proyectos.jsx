import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import "../../../css/EstilosProyecto/Proyectos.css";
import "../../../css/EstilosHeader/HeaderProyecto.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ModalConfirmacion from "../../Components/ComponenteModal/ModalConfirmacion";
import ModalMensajeExito from "../../Components/ComponenteModal/ModalMensajeExito";
import ModalError from "../../Components/ComponenteModal/ModalError";

const Proyectos = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCreateSuccessMessage, setShowCreateSuccessMessage] =
        useState(false);
    const [showEditSuccessMessage, setShowEditSuccessMessage] = useState(false);
    const [showDeleteSuccessMessage, setShowDeleteSuccessMessage] =
        useState(false);
    const [startDate, setStartDate] = useState(""); // Estado para la fecha de inicio
    const [endDate, setEndDate] = useState(""); // Estado para la fecha de fin
    const [showErrorMessage, setShowErrorMessage] = useState(false); // Estado para el mensaje de error
    const [errorMessage, setErrorMessage] = useState(""); // Estado para el texto d el mensaje de error
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
                console.log("Proyectos recibidos:", data);

                // Formatear las fechas para asegurarse de que se muestren en formato correcto
                const formattedProjects = data.map((project) => ({
                    ...project,
                    FECHA_INICIO_PROYECTO: project.FECHA_INICIO_PROYECTO
                        ? project.FECHA_INICIO_PROYECTO.split("T")[0] // Si viene con "T", se elimina
                        : "",
                    FECHA_FIN_PROYECTO: project.FECHA_FIN_PROYECTO
                        ? project.FECHA_FIN_PROYECTO.split("T")[0]
                        : "",
                }));

                setProjects(formattedProjects);
            })
            .catch((error) => console.error("Error fetching projects:", error));
    }, []);

    // Función para guardar o editar un proyecto
    const handleSaveProject = () => {
        if (!projectName || !projectDescription || !startDate || !endDate) {
            setErrorMessage(
                "Por favor, complete todos los campos obligatorios."
            );
            setShowErrorMessage(true);
            return;
        }

        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        const formattedStartDate = startDate; // Usa directamente el estado
        const formattedEndDate = endDate; // Usa directamente el estado

        const formData = new FormData();
        formData.append("NOMBRE_PROYECTO", projectName);
        formData.append("DESCRIP_PROYECTO", projectDescription);
        formData.append("FECHA_INICIO_PROYECTO", formattedStartDate);
        formData.append("FECHA_FIN_PROYECTO", formattedEndDate);
        formData.append("ID_DOCENTE", docenteId);

        if (image) {
            formData.append("PORTADA_PROYECTO", image);
        }

        if (isEditing) {
            formData.append("_method", "PUT");
        }

        const url = isEditing
            ? `http://localhost:8000/api/proyectos/${projectToEdit.ID_PROYECTO}`
            : "http://localhost:8000/api/proyectos";

        fetch(url, {
            method: "POST",
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
                const formattedData = {
                    ...data,
                    FECHA_INICIO_PROYECTO:
                        data.FECHA_INICIO_PROYECTO?.split("T")[0],
                    FECHA_FIN_PROYECTO: data.FECHA_FIN_PROYECTO?.split("T")[0],
                };

                const updatedProjects = isEditing
                    ? projects.map((project) =>
                          project.ID_PROYECTO === projectToEdit.ID_PROYECTO
                              ? formattedData
                              : project
                      )
                    : [...projects, formattedData];

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

        // Asegúrate de que las fechas sean consistentes con el formato esperado (YYYY-MM-DD)
        setStartDate(project.FECHA_INICIO_PROYECTO);
        setEndDate(project.FECHA_FIN_PROYECTO);

        setProjectToEdit(project);
        setImage(null);
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
                    {projects.length > 0 ? (
                        projects.map((project, index) => (
                            <div key={index} className="project-item">
                                {project.PORTADA_PROYECTO ? (
                                    <img
                                        src={`http://localhost:8000/storage/${project.PORTADA_PROYECTO}`}
                                        alt="Icono del proyecto"
                                        width="50"
                                        height="50"
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
                                        className="project-title"
                                    >
                                        {project.NOMBRE_PROYECTO}
                                    </h3>

                                    <p className="project-description">
                                        {project.DESCRIP_PROYECTO}
                                    </p>

                                    <div className="project-dates">
                                        <p>
                                            <strong>Fecha de inicio:</strong>{" "}
                                            {project.FECHA_INICIO_PROYECTO
                                                ? new Date(
                                                      project.FECHA_INICIO_PROYECTO +
                                                          "T00:00:00"
                                                  ).toLocaleDateString(
                                                      "es-ES",
                                                      {
                                                          weekday: "long",
                                                          day: "2-digit",
                                                          month: "long",
                                                          year: "numeric",
                                                      }
                                                  )
                                                : ""}
                                        </p>
                                        <p>
                                            <strong>Fecha de fin:</strong>{" "}
                                            {project.FECHA_FIN_PROYECTO
                                                ? new Date(
                                                      project.FECHA_FIN_PROYECTO +
                                                          "T00:00:00"
                                                  ).toLocaleDateString(
                                                      "es-ES",
                                                      {
                                                          weekday: "long",
                                                          day: "2-digit",
                                                          month: "long",
                                                          year: "numeric",
                                                      }
                                                  )
                                                : ""}
                                        </p>
                                    </div>
                                </div>

                                <div className="project-actions">
                                    <button
                                        className="action-btn"
                                        onClick={() =>
                                            handleOpenEditModal(index)
                                        }
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
                        ))
                    ) : (
                        <p className="no-data-message">
                            No hay proyectos registrados.
                        </p>
                    )}
                </div>
            </div>

            {/* Modal para crear/editar proyectos */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3 className="etapa-modal-title">
                            {isEditing
                                ? "Editar Proyecto"
                                : "Detalles del Proyecto"}
                        </h3>
                        <div className="form-fields">
                            <div className="field">
                                <label
                                    htmlFor="projectName"
                                    className="etapa-label"
                                >
                                    Nombre del Proyecto:
                                </label>
                                <input
                                    id="projectName"
                                    type="text"
                                    value={projectName}
                                    onChange={(e) =>
                                        setProjectName(e.target.value)
                                    }
                                    placeholder="Ingrese el nombre del proyecto"
                                    className="etapa-input"
                                />
                            </div>

                            <div className="date-fields">
                                <div className="field">
                                    <label
                                        htmlFor="startDate"
                                        className="etapa-label"
                                    >
                                        Fecha de inicio:
                                    </label>
                                    <input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        className="etapa-input"
                                    />
                                </div>
                                <div className="field">
                                    <label
                                        htmlFor="endDate"
                                        className="etapa-label"
                                    >
                                        Fecha de fin:
                                    </label>
                                    <input
                                        id="endDate"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        className="etapa-input"
                                    />
                                </div>
                            </div>

                            <div className="description-photo-container">
                                <div className="field description-field">
                                    <label
                                        htmlFor="projectDescription"
                                        className="etapa-label"
                                    >
                                        Descripción del Proyecto:
                                    </label>
                                    <textarea
                                        id="projectDescription"
                                        value={projectDescription}
                                        onChange={(e) =>
                                            setProjectDescription(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Ingrese la descripción del proyecto"
                                        className="etapa-textarea"
                                    />
                                </div>
                                <div className="upload-container">
                                    <label className="etapa-label">
                                        Incluya una foto:
                                    </label>
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
                                                    Pulsa aquí para añadir
                                                    archivos
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
