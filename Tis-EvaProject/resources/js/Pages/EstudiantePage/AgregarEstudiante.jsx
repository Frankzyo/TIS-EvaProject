import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderEstudiante from "../../Components/ComponenteHeader/HeaderEstudiante";
import SidebarEstudiante from "../../Components/ComponenteSidebar/SidebarEstudiante";
import "../../../css/EstilosProyecto/Proyectos.css";
import "../../../css/EstilosEstudiante/Estudiantes.css";
import "../../../css/EstilosHeader/HeaderEstudiante.css";
import "../../../css/Loader.css";
import "../../../css/EstilosSidebar/SidebarEstudiante.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ModalConfirmacion from "../../Components/ComponenteModal/ModalConfirmacion";
import ModalMensajeExito from "../../Components/ComponenteModal/ModalMensajeExito";
import ModalError from "../../Components/ComponenteModal/ModalError";

const AgregarEstudiante = () => {
    const navigate = useNavigate();
    const { groupId, projectId } = useParams();
    const [errorMessage, setErrorMessage] = useState("");
    const [isRepresentanteLegal, setIsRepresentanteLegal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [groupInfo, setGroupInfo] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCreateSuccessMessage, setShowCreateSuccessMessage] =
        useState(false);
    const [showEditSuccessMessage, setShowEditSuccessMessage] = useState(false);
    const [showDeleteSuccessMessage, setShowDeleteSuccessMessage] =
        useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [students, setStudents] = useState([]);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [studentName, setStudentName] = useState("");
    const [studentLastName, setStudentLastName] = useState("");
    const [studentEmail, setStudentEmail] = useState("");
    const [studentToEdit, setStudentToEdit] = useState(null);
    const [projectDetails, setProjectDetails] = useState({});
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
        const role = localStorage.getItem("ROLE");
        const estudianteId = localStorage.getItem("ID_EST");
        const representanteLegal = localStorage.getItem("IS_RL");

        if (role !== "Estudiante" || !estudianteId) {
            navigate("/login");
        }

        setIsRepresentanteLegal(representanteLegal === "true");
    }, [navigate]);

    useEffect(() => {
        // Cargar los datos del grupo usando el groupId
        fetch(`http://localhost:8000/api/grupos/${groupId}`)
            .then((response) => response.json())
            .then((data) => {
                if (
                    data.message === "No autorizado" ||
                    data.message === "Grupo no encontrado o no autorizado"
                ) {
                    console.error(data.message);
                } else {
                    setGroupInfo(data); // Almacena los datos del grupo, incluida la imagen, en el estado
                }
            })
            .catch((error) =>
                console.error("Error al cargar el grupo:", error)
            );
    }, [groupId]);

    useEffect(() => {
        // Aquí puedes utilizar `groupId` para cargar los datos específicos de los estudiantes del grupo
        console.log("Cargando estudiantes del grupo con ID:", groupId);
        // Lógica para obtener los estudiantes de este grupo
    }, [groupId]);

    const handleOpenConfirmModal = (index) => {
        setStudentToDelete(index);
        setShowConfirmModal(true);
    };

    const handleDeleteStudent = () => {
        const studentId = students[studentToDelete].ID_EST;

        // Verifica si el estudiante a eliminar es el Representante Legal (usuario logueado)
        if (studentId === localStorage.getItem("ID_EST")) {
            setErrorMessage("No puedes eliminar al Representante Legal.");
            setShowErrorMessage(true);
            return;
        }

        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        fetch(`http://localhost:8000/api/estudiantes/${studentId}`, {
            method: "DELETE",
            headers: {
                "X-CSRF-TOKEN": csrfToken,
                Accept: "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error al eliminar estudiante");
                }
                return response.json();
            })
            .then(() => {
                // Actualiza la lista de estudiantes en el frontend
                setStudents((prevStudents) =>
                    prevStudents.filter((_, index) => index !== studentToDelete)
                );
                setShowConfirmModal(false);
                setStudentToDelete(null);
                setShowDeleteSuccessMessage(true); // Muestra el mensaje de éxito al eliminar
            })
            .catch((error) => {
                console.error("Error al eliminar estudiante:", error);
                setErrorMessage(
                    "Hubo un problema al eliminar el estudiante. Intente nuevamente."
                );
                setShowErrorMessage(true);
            });
    };

    const handleOpenModal = (isEditMode = false, student = null) => {
        setIsEditing(isEditMode);
        if (isEditMode && student) {
            setStudentToEdit(student);
            setStudentName(student.NOMBRE_ESTUDIANTE);
            setStudentLastName(student.APELLIDO_ESTUDIANTE);
            setStudentEmail(student.EMAIL_ESTUDIANTE);
        } else {
            setStudentToEdit(null);
            setStudentName("");
            setStudentEmail("");
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setStudentToEdit(null);
        setStudentName("");
        setStudentLastName("");
        setStudentEmail("");
    };

    const fetchStudents = () => {
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        fetch(`http://localhost:8000/api/estudiantes?ID_GRUPO=${groupId}`, {
            method: "GET",
            headers: {
                "X-CSRF-TOKEN": csrfToken,
                Accept: "application/json",
            },
            credentials: "include", // Agrega esto para incluir las cookies de sesión
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error al cargar estudiantes");
                }
                return response.json();
            })
            .then((data) => {
                setStudents(data);
            })
            .catch((error) => {
                console.error("Error al cargar estudiantes:", error);
                setErrorMessage("Error al cargar estudiantes");
                setShowErrorMessage(true);
            });
    };

    // Usar el hook useEffect para cargar los estudiantes cuando cambie el groupId
    useEffect(() => {
        fetchStudents();
    }, [groupId]);

    const handleSaveStudent = () => {
        if (!studentName || !studentEmail) {
            setErrorMessage(
                "Por favor, complete todos los campos obligatorios."
            );
            setShowErrorMessage(true);
            return;
        }

        setIsLoading(true);

        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

        const formData = new FormData();
        formData.append("NOMBRE_EST", studentName);
        formData.append("APELLIDO_EST", studentLastName || "");
        formData.append("EMAIL_EST", studentEmail);
        formData.append("ID_GRUPO", groupId);
        formData.append("ID_PROYECTO", projectId);

        fetch("http://localhost:8000/api/estudiantes", {
            method: "POST",
            headers: {
                "X-CSRF-TOKEN": csrfToken,
                Accept: "application/json",
            },
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        throw new Error(
                            errorData.message ||
                                "Error al registrar el estudiante"
                        );
                    });
                }
                return response.json();
            })
            .then((data) => {
                setStudents((prevStudents) => [...prevStudents, data]);
                setShowCreateSuccessMessage(true);
                handleCloseModal();
            })
            .catch((error) => {
                console.error("Error al registrar el estudiante:", error);
                setErrorMessage(
                    "Hubo un problema al registrar el estudiante. Intente nuevamente."
                );
                setShowErrorMessage(true);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="estudiantes-page">
            {/* Header */}
            <HeaderEstudiante />
            {/* Contenedor principal con sidebar y contenido */}
            <div className="estudiantes-layout">
                {/* Sidebar */}
                <SidebarEstudiante
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                    isRepresentanteLegal={isRepresentanteLegal}
                />
                {/* Contenido principal */}
                <div className="estudiantes-content">
                    {groupInfo && (
                        <div className="group-info-section">
                            <img
                                src={
                                    groupInfo.PORTADA_GRUPO
                                        ? `http://localhost:8000/storage/${groupInfo.PORTADA_GRUPO}`
                                        : "https://via.placeholder.com/150"
                                }
                                alt="Icono del grupo"
                                className="group-image"
                            />
                            <div className="group-info-text">
                                <h2 className="group-title">
                                    {groupInfo.NOMBRE_GRUPO}
                                </h2>
                                <p className="group-description">
                                    {groupInfo.DESCRIP_GRUPO ||
                                        "Descripción no disponible"}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="divisor-container">
                        <div className="divisor-est"></div>
                    </div>

                    <div className="estudiantes-container">
                        <div className="container">
                            <div className="projects-header">
                                <h2>Estudiantes</h2>
                                {isRepresentanteLegal && (
                                    <button
                                        className="new-project-btn"
                                        onClick={() => handleOpenModal()}
                                    >
                                        <i className="fas fa-plus"></i> Añadir
                                        estudiante
                                    </button>
                                )}
                            </div>

                            <div className="project-list">
                                {students.map((student, index) => (
                                    <div key={index} className="project-item">
                                        <img
                                            src={
                                                student.FOTO_EST
                                                    ? `http://localhost:8000/storage/${student.FOTO_EST}`
                                                    : "https://via.placeholder.com/50"
                                            }
                                            alt="Foto del estudiante"
                                            className="student-photo"
                                            width="50"
                                            height="50"
                                        />
                                        <div className="project-info">
                                            <h3>
                                                {`${student.NOMBRE_EST || ""} ${
                                                    student.APELLIDO_EST || ""
                                                }`.trim()}
                                            </h3>
                                            <p>{student.EMAIL_EST}</p>
                                        </div>
                                        <div className="project-actions">
                                            {isRepresentanteLegal &&
                                                `${student.ID_EST}` !==
                                                    localStorage.getItem(
                                                        "ID_EST"
                                                    ) && (
                                                    <>
                                                        <button
                                                            className="action-btn"
                                                            onClick={() =>
                                                                handleOpenConfirmModal(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </>
                                                )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Modales para agregar, editar y eliminar estudiantes */}
                    {showModal && (
                        <>
                            <div
                                className="estudiantes-modal-overlay"
                                onClick={handleCloseModal}
                            ></div>
                            <div
                                className="estudiantes-modal-content"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="estudiantes-modal-header">
                                    {isEditing
                                        ? "Editar Estudiante"
                                        : "Añadir Estudiante"}
                                </h3>
                                <div className="estudiantes-form-content">
                                    <input
                                        type="text"
                                        value={studentName}
                                        onChange={(e) =>
                                            setStudentName(e.target.value)
                                        }
                                        placeholder="Nombre del estudiante*"
                                        className="estudiantes-input-field"
                                    />
                                    <input
                                        type="text"
                                        value={studentLastName}
                                        onChange={(e) =>
                                            setStudentLastName(e.target.value)
                                        }
                                        placeholder="Apellido del estudiante"
                                        className="estudiantes-input-field"
                                    />
                                    <input
                                        type="email"
                                        value={studentEmail}
                                        onChange={(e) =>
                                            setStudentEmail(e.target.value)
                                        }
                                        placeholder="Correo del estudiante*"
                                        className="estudiantes-input-field"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button
                                        onClick={handleCloseModal}
                                        className="cancel-btn"
                                    >
                                        Cancelar
                                    </button>
                                    {isLoading ? (
                                        <div className="loader"></div>
                                    ) : (
                                        <button
                                            onClick={handleSaveStudent}
                                            className="create-btn"
                                        >
                                            {isEditing
                                                ? "Guardar cambios"
                                                : "Añadir"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {showConfirmModal && (
                        <ModalConfirmacion
                            show={showConfirmModal}
                            onClose={() => setShowConfirmModal(false)}
                            onConfirm={handleDeleteStudent}
                            title="Confirmar eliminación"
                            message="¿Está seguro de que desea eliminar a este estudiante?"
                        />
                    )}

                    {showDeleteSuccessMessage && (
                        <ModalMensajeExito
                            message="¡Se eliminó al estudiante correctamente!"
                            onClose={() => setShowDeleteSuccessMessage(false)}
                        />
                    )}

                    {showCreateSuccessMessage && (
                        <ModalMensajeExito
                            message="¡Se agregó al estudiante exitosamente!"
                            onClose={() => setShowCreateSuccessMessage(false)}
                        />
                    )}

                    {showEditSuccessMessage && (
                        <ModalMensajeExito
                            message="¡Se guardaron los cambios exitosamente!"
                            onClose={() => setShowEditSuccessMessage(false)}
                        />
                    )}

                    {showErrorMessage && (
                        <ModalError
                            errorMessage="Por favor, complete todos los campos obligatorios."
                            closeModal={() => setShowErrorMessage(false)}
                        />
                    )}
                </div>{" "}
                {/* Fin de estudiantes-content */}
            </div>{" "}
            {/* Fin de estudiantes-layout */}
        </div>
    );
};

export default AgregarEstudiante;
