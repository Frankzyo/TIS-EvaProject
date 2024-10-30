import React, { useState, useEffect } from "react";
import HeaderProyecto from "../Components/HeaderProyecto";
import "../../css/grupos.css";
import "../../css/HeaderProyecto.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Grupos = () => {
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCreateSuccessMessage, setShowCreateSuccessMessage] =
        useState(false);
    const [showEditSuccessMessage, setShowEditSuccessMessage] = useState(false);
    const [showDeleteSuccessMessage, setShowDeleteSuccessMessage] =
        useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false); // Estado para el mensaje de error
    const [errorMessage, setErrorMessage] = useState(""); // Estado para el texto del mensaje de error
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [groups, setGroups] = useState([]);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [groupToEdit, setGroupToEdit] = useState(null); // Estado para el grupo a editar
    const [isEditing, setIsEditing] = useState(false);
    const [image, setImage] = useState(null); // Estado para la imagen seleccionada
    const isModalOpen =
        showModal ||
        showConfirmModal ||
        showCreateSuccessMessage ||
        showEditSuccessMessage ||
        showDeleteSuccessMessage ||
        showErrorMessage;

    // Obtener lista de grupos al cargar el componente
    useEffect(() => {
        fetch("http://localhost:8000/api/grupo", {
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
                console.log("Grupos recibidos:", data); // Imprime los datos en la consola para verificar
                setGroups(data);
            })
            .catch((error) => console.error("Error fetching groups:", error));
    }, []);

    // Función para guardar o editar un grupo
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
        formData.append("FECHA_INICIO_GRUPO", "2024-01-01");
        formData.append("FECHA_FIN_GRUPO", "2024-12-31");

        if (image) {
            formData.append("PORTADA_GRUPO", image);
        }

        if (isEditing) {
            formData.append("_method", "PUT"); // Forzar el método PUT mediante el campo _method
        }

        const url = isEditing
            ? `http://localhost:8000/api/grupo/${groupToEdit.ID_GRUPO}`
            : "http://localhost:8000/api/grupo";

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
                        "Error al guardar el grupo: " + response.statusText
                    );
                }
                return response.json();
            })
            .then((data) => {
                const updatedGroups = isEditing
                    ? groups.map((group) =>
                          group.ID_GRUPO === groupToEdit.ID_GRUPO
                              ? data
                              : group
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
        setGroupName(group.NOMBRE_GRUPO);
        setGroupDescription(group.DESCRIP_GRUPO);
        setGroupToEdit(group); // Guarda todo el grupo, no solo el ID
        setImage(null); // Asegúrate de limpiar la imagen seleccionada previamente
        setIsEditing(true);
        setShowModal(true);
    };

    const handleOpenConfirmModal = (index) => {
        setGroupToDelete(index);
        setShowConfirmModal(true);
    };

    const handleDeleteGroup = () => {
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content");
        fetch(
            `http://localhost:8000/api/grupo/${groups[groupToDelete].ID_GRUPO}`,
            {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                },
            }
        )
            .then(() => {
                const updatedGroups = groups.filter(
                    (_, index) => index !== groupToDelete
                );
                setGroups(updatedGroups);
                setShowConfirmModal(false);
                setGroupToDelete(null);
                setShowDeleteSuccessMessage(true);
            })
            .catch((error) => console.error("Error deleting group:", error));
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
            return `http://localhost:8000/storage/${groupToEdit.PORTADA_GRUPO}`; // Muestra la imagen existente
        }
        return null;
    };

    return (
        <div>
            <HeaderProyecto isModalOpen={isModalOpen} />

            <div className={`container ${isModalOpen ? "disabled" : ""}`}>
                <div className="groups-header">
                    <h2>Mis grupos</h2>
                    <button
                        className="new-group-btn"
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

                <div className="group-list">
                    {groups.map((group, index) => (
                        <div key={index} className="group-item">
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
                            <div className="group-info">
                                <h3>{group.NOMBRE_GRUPO}</h3>
                                <p>{group.DESCRIP_GRUPO}</p>
                            </div>
                            <div className="group-actions">
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

         {/* Modal para crear/editar grupos */}
{showModal && (
    <div className="modal">
        <div className="modal-content">
            <h3>
                {isEditing
                    ? "Editar grupo"
                    : "Detalles del grupo"}
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
                    <p className="upload-title">Incluya una foto del grupo</p>
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
                                alt="Vista previa del grupo"
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
                    {isEditing
                        ? "Guardar cambios"
                        : "Crear grupo"}
                </button>
            </div>
        </div>
    </div>
)}


            {/* Modal de confirmación de eliminación */}
            {showConfirmModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>¿Estás seguro de que quieres eliminar este grupo?</h3>
                        <div className="modal-actions">
                            <button onClick={handleDeleteGroup}>
                                Eliminar
                            </button>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="cancel-btn"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de éxito en la creación del grupo */}
            {showCreateSuccessMessage && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>¡Grupo creado con éxito!</h3>
                        <button
                            onClick={() => setShowCreateSuccessMessage(false)}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de éxito en la edición del grupo */}
            {showEditSuccessMessage && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>¡Grupo editado con éxito!</h3>
                        <button
                            onClick={() => setShowEditSuccessMessage(false)}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de éxito en la eliminación del grupo */}
            {showDeleteSuccessMessage && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>¡Grupo eliminado con éxito!</h3>
                        <button
                            onClick={() => setShowDeleteSuccessMessage(false)}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de error */}
            {showErrorMessage && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Error</h3>
                        <p>{errorMessage}</p>
                        <button onClick={() => setShowErrorMessage(false)}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Grupos;
