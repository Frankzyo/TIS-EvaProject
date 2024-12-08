import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderEstudiante from "../Components/HeaderEstudiante";
import SidebarEstudiante from "../Components/SidebarEstudiante";
import axios from "axios";
import "../../css/Proyectos.css"; // Reutiliza el CSS de Proyectos
import "../../css/Grupos.css"; // Reutiliza el CSS de Proyectos
import "../../css/HeaderEstudiante.css";
import "../../css/SidebarEstudiante.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ModalConfirmacion from "../Components/ModalConfirmacion";
import ModalMensajeExito from "../Components/ModalMensajeExito";
import ModalError from "../Components/ModalError";

const GrupoEstudiante = () => {
    const navigate = useNavigate();
    const [defenseDays, setDefenseDays] = useState([]);
    const [proyecto, setProyecto] = useState(null);
    const [isRegisteredFech, setIsRegisteredFech] = useState(
        JSON.parse(localStorage.getItem("isRegisteredFech")) || {}
    );
    const [showModal, setShowModal] = useState(false);
    const { projectId, groupId } = useParams();
    const [isRepresentanteLegal, setIsRepresentanteLegal] = useState(false);
    const [isRegistered, setIsRegistered] = useState(
        JSON.parse(localStorage.getItem("isRegistered")) || {}
    );
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
    const [showDeleteErrorMessage, setShowDeleteErrorMessage] = useState(false);
    const [studentGroupId, setStudentGroupId] = useState(
        localStorage.getItem("studentGroupId") || null
    );
    const [createdGroupId, setCreatedGroupId] = useState(
        localStorage.getItem("createdGroupId") || null
    );
    const [successMessage, setSuccessMessage] = useState("");
    const isRL = localStorage.getItem("IS_RL") === "true"; // Verificar si el estudiante es RL
    const isModalOpen =
        showModal ||
        showConfirmModal ||
        showCreateSuccessMessage ||
        showEditSuccessMessage ||
        showDeleteSuccessMessage ||
        showErrorMessage;
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const daysOrder = {
        Lunes: 1,
        Martes: 2,
        Miércoles: 3,
        Jueves: 4,
        Viernes: 5,
        Sábado: 6,
    };

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);
    useEffect(() => {
        const fetchDefenseDays = async () => {
            try {
                const studentId = localStorage.getItem("ID_EST");
                const response = await axios.get(
                    `http://localhost:8000/api/proyectos/${projectId}/fechas_defensa/${studentId}`,
                    { withCredentials: true }
                );

                setDefenseDays(sortDefenseDays(response.data));
            } catch (error) {
                console.error("Error al cargar las fechas de defensa:", error);
            }
        };

        fetchDefenseDays();
    }, [projectId]);

    useEffect(() => {
        const fetchGroupDefenseRegistrationStatus = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/estudiante/${localStorage.getItem(
                        "ID_EST"
                    )}/group-defense-registration-status`,
                    { withCredentials: true }
                );
                const { isRegisteredFech } = response.data;
                setIsRegisteredFech(isRegisteredFech);
                localStorage.setItem(
                    "isRegisteredFech",
                    JSON.stringify(isRegisteredFech)
                );
            } catch (error) {
                console.error(
                    "Error al cargar el estado de registro de defensa del grupo:",
                    error
                );
            }
        };
        fetchGroupDefenseRegistrationStatus();
    }, []);

    const handleRegisterToDefense = (defenseId) => {
        axios
            .post(
                `http://localhost:8000/api/fechas_defensa/${defenseId}/registrar`,
                {},
                { withCredentials: true }
            )
            .then((response) => {
                alert(
                    response.data.message || "Registro exitoso en la defensa"
                );
                setIsRegisteredFech((prevState) => ({
                    ...prevState,
                    [defenseId]: true,
                }));
                localStorage.setItem(
                    "isRegisteredFech",
                    JSON.stringify({
                        ...isRegisteredFech,
                        [defenseId]: true,
                    })
                );
            })
            .catch((error) => {
                if (error.response && error.response.status === 409) {
                    alert("Ya estás registrado en esta defensa");
                } else {
                    alert(
                        "Hubo un problema al registrarse en la defensa. Intente nuevamente."
                    );
                }
                console.error("Error al registrarse en la defensa:", error);
            });
    };

    useEffect(() => {
        const role = localStorage.getItem("ROLE");
        const estudianteId = localStorage.getItem("ID_EST");
        const representanteLegal = localStorage.getItem("IS_RL");

        // Verificar si el usuario tiene el rol de "Estudiante" y un ID de estudiante
        if (role !== "Estudiante" || !estudianteId) {
            navigate("/login"); // Redirige al login si no cumple las condiciones
        } else {
            // Solo establece el estado de Representante Legal si es un estudiante autenticado
            setIsRepresentanteLegal(representanteLegal === "true");
        }
    }, [navigate]);
    useEffect(() => {
        const fetchRegistrationStatus = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/estudiante/${localStorage.getItem(
                        "ID_EST"
                    )}/registration-status`,
                    { withCredentials: true }
                );
                const { isRegistered, groupId } = response.data;
                setIsRegistered(isRegistered);
                setStudentGroupId(groupId);
                localStorage.setItem(
                    "isRegistered",
                    JSON.stringify(isRegistered)
                );
                localStorage.setItem("studentGroupId", groupId);
            } catch (error) {
                console.error("Error al cargar el estado de registro:", error);
            }
        };
        fetchRegistrationStatus();
    }, []);
    useEffect(() => {
        if (!projectId) {
            console.warn("Esperando a que projectId esté definido...");
            return; // Salir del efecto hasta que projectId esté disponible
        }

        const obtenerDatosProyecto = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/proyectos/${projectId}`,
                    { withCredentials: true }
                );
                setProyecto(response.data);
            } catch (error) {
                console.error("Error al cargar el proyecto:", error);
            }
        };

        const obtenerGrupos = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/proyectos/${projectId}/grupos-hora`,
                    { withCredentials: true }
                );

                setGroups(response.data.grupos);

                // Verificar si `studentGroupId` existe y almacenarlo
                const registeredGroupId = response.data.studentGroupId;

                if (registeredGroupId) {
                    setStudentGroupId(registeredGroupId);
                    localStorage.setItem("studentGroupId", registeredGroupId);
                } else {
                    // Si no hay un grupo registrado, verifica si el estudiante ha creado un grupo
                    const createdId = response.data.createdGroupId;
                    setCreatedGroupId(createdId);
                    if (createdId) {
                        localStorage.setItem("createdGroupId", createdId);
                    } else {
                        localStorage.removeItem("createdGroupId");
                    }
                }
            } catch (error) {
                console.error(
                    "Error al cargar los grupos o el estudiante:",
                    error
                );
            }
        };

        obtenerDatosProyecto();
        obtenerGrupos();
    }, [projectId]);

    const handleRegister = (groupId) => {
        axios
            .post(
                `http://localhost:8000/api/grupos/${groupId}/registrar`,
                {},
                { withCredentials: true }
            )
            .then((response) => {
                setIsRegistered((prevState) => ({
                    ...prevState,
                    [groupId]: true,
                }));
                localStorage.setItem(
                    "isRegistered",
                    JSON.stringify({
                        ...isRegistered,
                        [groupId]: true,
                    })
                );
                setStudentGroupId(groupId);
                localStorage.setItem("studentGroupId", groupId);
            })
            .catch((error) => {
                if (error.response && error.response.status === 409) {
                    alert("Ya estás registrado en este grupo");
                } else {
                    alert(
                        "Hubo un problema al registrarse. Intente nuevamente."
                    );
                }
                console.error("Error al registrarse:", error);
            });
    };
    const sortDefenseDays = (days) => {
        return days.sort((a, b) => {
            // Comparar días usando el objeto daysOrder
            const dayComparison = daysOrder[a.day] - daysOrder[b.day];
            if (dayComparison !== 0) return dayComparison;

            // Comparar horas de inicio, asegurándonos de que startTime y endTime existen
            const startTimeA = a.startTime || a.HR_INIDEF || "";
            const startTimeB = b.startTime || b.HR_INIDEF || "";
            const startTimeComparison = startTimeA.localeCompare(startTimeB);
            if (startTimeComparison !== 0) return startTimeComparison;

            // Comparar horas de fin, asegurándonos de que endTime existe
            const endTimeA = a.endTime || a.HR_FINDEF || "";
            const endTimeB = b.endTime || b.HR_FINDEF || "";
            return endTimeA.localeCompare(endTimeB);
        });
    };
    const handleGroupClick = (groupId) => {
        if (groupId === parseInt(studentGroupId)) {
            // Navega solo si es el grupo registrado del estudiante
            navigate(
                `/proyectos/${projectId}/grupos/${groupId}/agregar-estudiante`
            );
        } else {
            // Muestra el modal de error si intenta acceder a otro grupo
            setErrorMessage(
                "Solo puedes acceder al grupo en el que estás registrado."
            );
            setShowErrorMessage(true);
        }
    };
    const handleSaveGroup = () => {
        if (!groupName || !groupDescription) {
            setErrorMessage("Por favor, complete todos los campos obligatorios.");
            setShowErrorMessage(true);
            return;
        }
    
        // Verificar si el nombre del grupo ya existe, excluyendo el grupo que se está editando
        const isDuplicate = groups.some(
            (group) =>
                group.NOMBRE_GRUPO.toLowerCase() === groupName.toLowerCase() &&
                (!isEditing || group.ID_GRUPO !== groupToEdit.ID_GRUPO)
        );
        if (isDuplicate) {
            setErrorMessage("El nombre del grupo ya existe. Por favor, elija otro.");
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
    
        // Añadir CREADO_POR solo si estamos creando un nuevo grupo
        if (!isEditing) {
            formData.append("CREADO_POR", localStorage.getItem("ID_EST"));
        }
    
        if (image) {
            formData.append("PORTADA_GRUPO", image);
        }
    
        // Si estamos en modo edición, añadimos _method para forzar PUT
        if (isEditing) {
            formData.append("_method", "PUT");
        }
    
        const url = isEditing
            ? `http://localhost:8000/api/grupos/${groupToEdit.ID_GRUPO}`
            : "http://localhost:8000/api/grupos";
    
        axios
            .post(url, formData, {
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                    "Content-Type": "multipart/form-data",
                    Accept: "application/json",
                },
            })
            .then((response) => {
                const newGroup = response.data;
    
                if (isEditing) {
                    setGroups(
                        groups.map((group) =>
                            group.ID_GRUPO === newGroup.ID_GRUPO ? newGroup : group
                        )
                    );
                    setShowEditSuccessMessage(true);
                } else {
                    setGroups([...groups, newGroup]);
                    setStudentGroupId(newGroup.ID_GRUPO);
                    localStorage.setItem("studentGroupId", newGroup.ID_GRUPO);
                    setCreatedGroupId(newGroup.ID_GRUPO);
                    localStorage.setItem("createdGroupId", newGroup.ID_GRUPO);
                    setShowCreateSuccessMessage(true);
                }
    
                setShowModal(false);
                setIsEditing(false);
                setGroupToEdit(null);
            })
            .catch((error) => {
                if (error.response && error.response.status === 422) {
                    setErrorMessage(
                        error.response.data.message ||
                            "Datos inválidos. Verifica los campos e intenta nuevamente."
                    );
                } else {
                    setErrorMessage(
                        "Hubo un problema al guardar el grupo. Intente nuevamente."
                    );
                }
                setShowErrorMessage(true);
            });
    };
    
    const handleOpenEditModal = (index) => {
        const group = groups[index];
        setGroupName(group.NOMBRE_GRUPO || "");
        setGroupDescription(group.DESCRIP_GRUPO || "");
        setGroupToEdit(group);
        setImage(null);
        setIsEditing(true);
        setShowModal(true);
    };
    const handleOpenConfirmModal = (id) => {
        if (id !== studentGroupId) {
            setErrorMessage("Solo puedes eliminar el grupo que creaste.");
            setShowErrorMessage(true);
            return;
        }
        setGroupToDelete(id);
        setShowConfirmModal(true);
    };

    const handleDeleteGroup = () => {
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");

        axios
            .delete(`http://localhost:8000/api/grupos/${groupToDelete}`, {
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                },
            })
            .then(() => {
                setGroups(
                    groups.filter((group) => group.ID_GRUPO !== groupToDelete)
                );
                setShowConfirmModal(false);
                setGroupToDelete(null);
                setShowDeleteSuccessMessage(true);

                if (studentGroupId === groupToDelete) {
                    setStudentGroupId(null);
                    localStorage.removeItem("studentGroupId");
                }
                localStorage.removeItem("createdGroupId");
            })
            .catch((error) => {
                console.error("Error al eliminar el grupo:", error);
                setShowDeleteErrorMessage(true);
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
            return URL.createObjectURL(image);
        }
        if (isEditing && groupToEdit && groupToEdit.PORTADA_GRUPO) {
            return `http://localhost:8000/storage/${groupToEdit.PORTADA_GRUPO}`;
        }
        return null;
    };

    return (
        <div
            className={`grupos-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            {/* Header */}
            <HeaderEstudiante isModalOpen={isModalOpen} />

            <div className="grupos-sidebar-content">
                {/* Sidebar */}
                <SidebarEstudiante
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={proyecto?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${proyecto?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                    groupId={groupId}
                    isRepresentanteLegal={isRepresentanteLegal}
                />

                {/* Contenedor del contenido principal */}
                <div className={`container ${isModalOpen ? "disabled" : ""}`}>
                    <div className="projects-header">
                        <h2>Días de defensas</h2>
                    </div>
                    <div className="defense-days-list">
                        {Array.isArray(defenseDays) &&
                        defenseDays.length > 0 ? (
                            defenseDays.map((defense, index) => {
                                const isAlreadyRegistered = Object.values(
                                    isRegisteredFech
                                ).some((registered) => registered === true);

                                return (
                                    <div
                                        key={index}
                                        className="defense-day-item"
                                    >
                                        <div className="defense-day-info">
                                            <h3 className="defense-day-title">
                                                {defense.day ||
                                                    "Día no especificado"}
                                            </h3>
                                            <p className="defense-day-time">
                                                {defense.HR_INIDEF ||
                                                    "Hora no especificada"}{" "}
                                                -{" "}
                                                {defense.HR_FINDEF ||
                                                    "Hora no especificada"}
                                            </p>
                                        </div>
                                        {defense.ID_GRUPO ? (
                                            defense.ID_GRUPO ===
                                            studentGroupId ? (
                                                <span className="registered-text">
                                                    Registrado
                                                </span>
                                            ) : (
                                                <span className="registered-text">
                                                    Reservado
                                                </span>
                                            )
                                        ) : !isAlreadyRegistered ? (
                                            <button
                                                onClick={() =>
                                                    handleRegisterToDefense(
                                                        defense.ID_FECHADEF
                                                    )
                                                }
                                                className="registered-button"
                                            >
                                                Registrarse
                                            </button>
                                        ) : (
                                            isRegisteredFech[
                                                defense.ID_FECHADEF
                                            ] && (
                                                <span className="registered-text">
                                                    Registrado
                                                </span>
                                            )
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p>No hay días de defensa disponibles.</p>
                        )}
                    </div>

                    <div className="projects-header">
                        <h2>Grupos</h2>
                        {!createdGroupId && !studentGroupId && (
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
                        )}
                    </div>

                    <div className="project-list">
                        {Array.isArray(groups) && groups.length > 0 ? (
                            groups.map((group, index) => (
                                <div key={index} className="project-item">
                                    <img
                                        src={
                                            group.PORTADA_GRUPO
                                                ? `http://localhost:8000/storage/${group.PORTADA_GRUPO}`
                                                : "https://via.placeholder.com/50"
                                        }
                                        alt="Icono del grupo"
                                        width="50"
                                        height="50"
                                    />
                                    <div className="project-info">
                                        <h3
                                            onClick={() =>
                                                handleGroupClick(group.ID_GRUPO)
                                            }
                                            style={{ cursor: "pointer" }}
                                        >
                                            {group.NOMBRE_GRUPO ||
                                                "Nombre no disponible"}
                                        </h3>
                                        <p>
                                            {group.DESCRIP_GRUPO ||
                                                "Descripción no disponible"}
                                        </p>
                                    </div>
                                    {isRL &&
                                        group.CREADO_POR ===
                                            parseInt(
                                                localStorage.getItem("ID_EST")
                                            ) &&
                                        (isRegistered ? (
                                            <span className="registered-text">
                                                Registrado
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    handleRegister(
                                                        group.ID_GRUPO
                                                    )
                                                }
                                                className="registered-button"
                                            >
                                                Registrarse
                                            </button>
                                        ))}
                                    {group.CREADO_POR ===
                                        parseInt(
                                            localStorage.getItem("ID_EST")
                                        ) && (
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
                                                    handleOpenConfirmModal(
                                                        group.ID_GRUPO
                                                    )
                                                }
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No hay grupos disponibles.</p>
                        )}
                    </div>

                    {successMessage && (
                        <div className="success-messages">{successMessage}</div>
                    )}
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
                    errorMessage={
                        errorMessage ||
                        "Por favor, complete los campos de título y descripción."
                    }
                    closeModal={() => setShowErrorMessage(false)}
                />
            )}
            {showErrorMessage && (
                <ModalError
                    title="Acceso Denegado"
                    errorMessage={errorMessage}
                    closeModal={() => setShowErrorMessage(false)}
                />
            )}

            {showDeleteErrorMessage && (
                <ModalError
                    errorMessage="Hubo un problema al eliminar el grupo. Intente nuevamente."
                    closeModal={() => setShowDeleteErrorMessage(false)}
                />
            )}
        </div>
    );
};

export default GrupoEstudiante;
