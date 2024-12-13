import React, { useState, useEffect } from "react";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import ModalError from "../../Components/ComponenteModal/ModalError";
import ModalConfirmacion from "../../Components/ComponenteModal/ModalConfirmacion";
import ModalMensajeExito from "../../Components/ComponenteModal/ModalMensajeExito";
import "../../../css/EstilosDocente/Perfil.css";

const Perfil = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(
        "configuracion-usuario"
    );
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showDeleteSuccessMessage, setShowDeleteSuccessMessage] =
        useState(false);
    const [userData, setUserData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        foto: "https://via.placeholder.com/100",
        bio: "",
    });
    const [newPhoto, setNewPhoto] = useState(null);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [showEditSuccessMessage, setShowEditSuccessMessage] = useState(false);
    const [
        showPasswordChangeSuccessMessage,
        setShowPasswordChangeSuccessMessage,
    ] = useState(false);
    const [errorMessage, setErrorMessage] = useState({}); // Estado para mensajes de error
    const [currentPasswordError, setCurrentPasswordError] = useState("");
    const [showPhotoError, setShowPhotoError] = useState(false);
    const [photoError, setPhotoError] = useState("");
    // Cargar datos del usuario
    useEffect(() => {
        fetch("http://localhost:8000/api/usuario-logueado", {
            credentials: "include",
        })
            .then((response) => response.json())
            .then((data) => {
                if (!data.error) {
                    setUserData({
                        nombre: data.nombre || "",
                        apellido: data.apellido || "",
                        email: data.email || "",
                        foto: data.foto
                            ? `http://localhost:8000/storage/${data.foto}`
                            : "https://via.placeholder.com/100",
                        bio: data.bio || "",
                    });
                }
            })
            .catch((error) =>
                console.error("Error al cargar los datos del usuario:", error)
            );
    }, []);

    // Manejar cambios en los campos de texto
    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value,
        });
    };
    const handleDeleteAccount = () => {
        fetch("http://localhost:8000/api/usuario-logueado/delete", {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute("content"),
            },
        })
            .then((response) => {
                if (response.ok) {
                    setShowDeleteSuccessMessage(true);
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 3000);
                } else {
                    throw new Error("Error al intentar eliminar la cuenta.");
                }
            })
            .catch((error) =>
                console.error("Error al eliminar la cuenta:", error)
            );
    };
    // Manejar carga de nueva imagen
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];

        if (file && !file.type.startsWith("image/")) {
            setPhotoError("Solo se permiten archivos de imagen.");
            setShowPhotoError(true); // Muestra el modal de error
            return;
        }

        setNewPhoto(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserData((prevState) => ({
                    ...prevState,
                    foto: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Guardar cambios en el backend
    const handleSaveChanges = () => {
        const formData = new FormData();
        formData.append("nombre", userData.nombre);
        formData.append("apellido", userData.apellido);
        formData.append("email", userData.email);
        if (newPhoto) {
            formData.append("foto", newPhoto);
        }

        fetch("http://localhost:8000/api/usuario-logueado/update", {
            method: "POST",
            body: formData,
            credentials: "include",
            headers: {
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute("content"),
            },
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    console.error(
                        "Error en la respuesta del servidor:",
                        response
                    );
                    throw new Error("Respuesta del servidor no válida");
                }
            })
            .then((data) => {
                console.log("Perfil actualizado con éxito:", data);
                setShowEditSuccessMessage(true); // Mostrar mensaje de éxito
                setTimeout(() => setShowEditSuccessMessage(false), 3000); // Ocultar después de 3 segundos
            })
            .catch((error) =>
                console.error("Error al actualizar el perfil:", error)
            );
    };

    // Manejar cambios en los campos de contraseña
    // Manejar cambios en los campos de contraseña
    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    // Enviar datos para cambiar la contraseña
    const handleChangePassword = () => {
        setErrorMessage({});
        setCurrentPasswordError(""); // Reset error messages

        // Expresión regular para la validación de contraseña segura
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        // Validar si las contraseñas coinciden
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setErrorMessage({
                confirmNewPassword: "Las contraseñas no coinciden.",
            });
            return;
        }

        // Validar si la nueva contraseña cumple con los requisitos de seguridad
        if (!passwordRegex.test(passwordData.newPassword)) {
            setErrorMessage({
                newPassword:
                    "La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos.",
            });
            return;
        }

        // Enviar la solicitud al backend si las validaciones pasan
        fetch("http://localhost:8000/api/usuario-logueado/change-password", {
            method: "POST",
            body: JSON.stringify({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                newPassword_confirmation: passwordData.confirmNewPassword,
            }),
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute("content"),
            },
            credentials: "include",
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        console.log("Error response data:", data); // Para depuración
                        if (
                            data.error === "La contraseña actual es incorrecta"
                        ) {
                            setCurrentPasswordError(
                                "La contraseña actual es incorrecta"
                            );
                        } else {
                            setCurrentPasswordError(
                                "Ocurrió un error al cambiar la contraseña"
                            );
                        }
                        throw new Error(data.error || "Error desconocido");
                    });
                }
                return response.json();
            })
            .then((data) => {
                if (data.message) {
                    setShowPasswordChangeSuccessMessage(true);
                    setTimeout(
                        () => setShowPasswordChangeSuccessMessage(false),
                        3000
                    );
                    setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmNewPassword: "",
                    });
                    setCurrentPasswordError(""); // Limpiar mensaje de error en caso de éxito
                }
            })
            .catch((error) =>
                console.error("Error al cambiar la contraseña:", error)
            );
    };

    // Renderizar contenido en función de la opción seleccionada
    const renderContent = () => {
        if (selectedOption === "configuracion-usuario") {
            return (
                <div className="perfil-info">
                    <div className="perfil-foto-section">
                        <img
                            src={userData.foto}
                            alt="Foto de perfil"
                            className="perfil-foto"
                        />
                        <input
                            type="file"
                            id="fileInput"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handlePhotoChange}
                        />
                        <button
                            className="change-photo-btn"
                            onClick={() =>
                                document.getElementById("fileInput").click()
                            }
                        >
                            Cambiar Foto
                        </button>
                        {photoError && (
                            <p className="error-message">{photoError}</p>
                        )}
                    </div>
                    <div className="perfil-form">
                        <label>Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={userData.nombre}
                            onChange={handleChange}
                        />

                        <label>Apellidos</label>
                        <input
                            type="text"
                            name="apellido"
                            value={userData.apellido}
                            onChange={handleChange}
                        />

                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                        />

                        <label>Biografía (máx. 210 caracteres)</label>
                        <textarea
                            name="bio"
                            value={userData.bio}
                            maxLength="210"
                            placeholder="Cuéntanos algo sobre ti..."
                            onChange={handleChange}
                        ></textarea>
                        <div className="button-container">
                            <button
                                className="save-btn"
                                onClick={handleSaveChanges}
                            >
                                Guardar
                            </button>
                            <button
                                className="delete-account-btn"
                                onClick={() => setShowDeleteConfirmModal(true)}
                            >
                                Eliminar cuenta
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else if (selectedOption === "cambiar-contrasena") {
            return (
                <div className="perfil-form">
                    <label>Contraseña actual</label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Tu contraseña actual"
                    />
                    {currentPasswordError && (
                        <p className="error-messagep">{currentPasswordError}</p>
                    )}

                    <label>Nueva contraseña</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Escribe una contraseña nueva"
                    />
                    {errorMessage.newPassword && (
                        <p className="error-messagep">
                            {errorMessage.newPassword}
                        </p>
                    )}

                    <label>Reescribe la nueva contraseña</label>
                    <input
                        type="password"
                        name="confirmNewPassword"
                        value={passwordData.confirmNewPassword}
                        onChange={handlePasswordChange}
                        placeholder="Reescribe la nueva contraseña"
                    />
                    {errorMessage.confirmNewPassword && (
                        <p className="error-messagep">
                            {errorMessage.confirmNewPassword}
                        </p>
                    )}

                    <button className="save-btn" onClick={handleChangePassword}>
                        Guardar
                    </button>
                </div>
            );
        }
    };

    return (
        <div className="perfil-container">
            <HeaderProyecto isModalOpen={isModalOpen} />
            {showPhotoError && (
                <ModalError
                    errorMessage={photoError}
                    closeModal={() => setShowPhotoError(false)}
                />
            )}
            {showEditSuccessMessage && (
                <div className="success-modal">
                    <div className="success-modal-content">
                        <h3>Mensaje</h3>
                        <div className="success-message">
                            <i className="fas fa-check-circle"></i>
                            <p>¡Se guardaron los cambios exitosamente!</p>
                        </div>
                        <button
                            onClick={() => setShowEditSuccessMessage(false)}
                            className="create-btn"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            )}

            {showPasswordChangeSuccessMessage && (
                <div className="success-modal">
                    <div className="success-modal-content">
                        <h3>Mensaje</h3>
                        <div className="success-message">
                            <i className="fas fa-check-circle"></i>
                            <p>¡Contraseña cambiada exitosamente!</p>
                        </div>
                        <button
                            onClick={() =>
                                setShowPasswordChangeSuccessMessage(false)
                            }
                            className="create-btn"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            )}
            <ModalConfirmacion
                show={showDeleteConfirmModal}
                onClose={() => setShowDeleteConfirmModal(false)}
                onConfirm={handleDeleteAccount}
                title="¿Estás seguro de que quieres eliminar tu cuenta?"
                message="Esta acción no se puede deshacer."
            />
            {showDeleteSuccessMessage && (
                <ModalMensajeExito
                    message="¡Cuenta eliminada exitosamente!"
                    onClose={() => setShowDeleteSuccessMessage(false)}
                />
            )}
            <div className="perfil-content">
                <aside className="perfil-sidebar">
                    <ul>
                        <li
                            className={
                                selectedOption === "configuracion-usuario"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setSelectedOption("configuracion-usuario")
                            }
                        >
                            CONFIGURACIÓN DE USUARIO
                        </li>
                        <li
                            className={
                                selectedOption === "cambiar-contrasena"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setSelectedOption("cambiar-contrasena")
                            }
                        >
                            CAMBIAR CONTRASEÑA
                        </li>
                    </ul>
                </aside>
                <div className="perfil-main">
                    <h2>
                        {selectedOption === "configuracion-usuario"
                            ? "Configuración de Usuario"
                            : "Cambiar contraseña"}
                    </h2>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Perfil;
