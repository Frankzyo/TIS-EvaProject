import React, { useEffect, useState } from "react";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import "../../../css/Perfil.css";
import "../../../css/auth/ApproveAccounts.css";
import axios from "axios";

const ApproveAccounts = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]); // Almacena todos los usuarios para asignar admin
    const [activeOption, setActiveOption] = useState("Usuarios Pendientes");

    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("Token encontrado en localStorage:", token);
        if (activeOption === "Usuarios Pendientes") {
            axios
                .get("http://localhost:8000/api/pending-users", {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    if (
                        response.headers["content-type"].includes(
                            "application/json"
                        )
                    ) {
                        console.log("Usuarios pendientes:", response.data);
                        setPendingUsers(response.data);
                    } else {
                        console.error("La respuesta no es JSON", response);
                    }
                })
                .catch((error) => {
                    if (error.response && error.response.status === 401) {
                        console.error(
                            "Error de autenticación: el usuario no está autorizado."
                        );
                    } else {
                        console.error("Otro error:", error);
                    }
                });
        } else if (activeOption === "Asignar Administrador") {
            axios
                .get("http://localhost:8000/api/all-users", {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    console.log("Respuesta completa de all-users:", response);
                    if (
                        response.headers["content-type"].includes(
                            "application/json"
                        )
                    ) {
                        console.log("Docentes recibidos:", response.data);
                        setAllUsers(response.data); // Establece todos los docentes sin filtrar
                    } else {
                        console.error("La respuesta no es JSON", response);
                    }
                })
                .catch((error) => {
                    if (error.response && error.response.status === 401) {
                        console.error(
                            "Error de autenticación: el usuario no está autorizado."
                        );
                    } else {
                        console.error("Otro error:", error);
                    }
                });
        }
    }, [activeOption]);

    const handleApprove = async (userId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `http://localhost:8000/api/approve-user/${userId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert(response.data.message);
            setPendingUsers(
                pendingUsers.filter((user) => user.ID_DOCENTE !== userId)
            );
        } catch (error) {
            console.error(error);
            alert("Error al aprobar el usuario.");
        }
    };

    const handleAssignAdmin = async (userId) => {
        const token = localStorage.getItem("token");
        console.log("Token encontrado en localStorage:", token);

        try {
            const response = await axios.post(
                `http://localhost:8000/api/assign-admin/${userId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );
            console.log("Respuesta completa:", response);
            alert(response.data.message);
        } catch (error) {
            console.error(
                "Error en la solicitud:",
                error.response ? error.response.data : error.message
            );
            alert("Error al asignar administrador.");
        }
    };

    const handleSidebarClick = (option) => {
        setActiveOption(option);
    };

    return (
        <div className="perfil-container">
            <HeaderProyecto isModalOpen={false} />
            <div className="perfil-content">
                <aside className="perfil-sidebar">
                    <ul>
                        <li
                            className={`sidebar-item ${
                                activeOption === "Usuarios Pendientes"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                handleSidebarClick("Usuarios Pendientes")
                            }
                        >
                            Usuarios Pendientes
                        </li>
                        <li
                            className={`sidebar-item ${
                                activeOption === "Asignar Administrador"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                handleSidebarClick("Asignar Administrador")
                            }
                        >
                            Asignar Administrador
                        </li>
                    </ul>
                </aside>
                <main className="perfil-main">
                    {activeOption === "Usuarios Pendientes" ? (
                        <>
                            <h2 className="approve-users-title">
                                Usuarios Pendientes de Aprobación
                            </h2>
                            <div className="approve-users-list">
                                {pendingUsers.length > 0 ? (
                                    pendingUsers.map((user) => (
                                        <div
                                            key={user.ID_DOCENTE}
                                            className="approve-users-card"
                                        >
                                            <img
                                                src={
                                                    user.FOTO_DOCENTE
                                                        ? `http://localhost:8000/storage/${user.FOTO_DOCENTE}`
                                                        : "https://via.placeholder.com/250"
                                                }
                                                alt={`${user.NOMBRE_DOCENTE} ${user.APELLIDO_DOCENTE}`}
                                                className="approve-users-profile-image"
                                            />
                                            <div className="approve-users-info">
                                                <div className="approve-users-info-item">
                                                    <span className="approve-users-label">
                                                        NOMBRE
                                                    </span>
                                                    <span className="approve-users-value">
                                                        {user.NOMBRE_DOCENTE}
                                                    </span>
                                                </div>
                                                <div className="approve-users-info-item">
                                                    <span className="approve-users-label">
                                                        APELLIDOS
                                                    </span>
                                                    <span className="approve-users-value">
                                                        {user.APELLIDO_DOCENTE}
                                                    </span>
                                                </div>
                                                <div className="approve-users-info-item">
                                                    <span className="approve-users-label">
                                                        Correo
                                                    </span>
                                                    <span className="approve-users-value">
                                                        {user.EMAIL_DOCENTE}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                className="change-photo-btn"
                                                onClick={() =>
                                                    handleApprove(
                                                        user.ID_DOCENTE
                                                    )
                                                }
                                            >
                                                Aprobar
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="approve-users-no-pending">
                                        No hay usuarios pendientes de
                                        aprobación.
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="approve-users-title">
                                Asignar Permisos de Administrador
                            </h2>
                            <div className="approve-users-list">
                                {allUsers.length > 0 ? (
                                    allUsers.map((user) => (
                                        <div
                                            key={user.ID_DOCENTE}
                                            className="approve-users-card"
                                        >
                                            <img
                                                src={
                                                    user.FOTO_DOCENTE
                                                        ? `http://localhost:8000/storage/${user.FOTO_DOCENTE}`
                                                        : "https://via.placeholder.com/250"
                                                }
                                                alt={`${user.NOMBRE_DOCENTE} ${user.APELLIDO_DOCENTE}`}
                                                className="approve-users-profile-image"
                                            />
                                            <div className="approve-users-info">
                                                <div className="approve-users-info-item">
                                                    <span className="approve-users-label">
                                                        NOMBRE
                                                    </span>
                                                    <span className="approve-users-value">
                                                        {user.NOMBRE_DOCENTE}
                                                    </span>
                                                </div>
                                                <div className="approve-users-info-item">
                                                    <span className="approve-users-label">
                                                        APELLIDOS
                                                    </span>
                                                    <span className="approve-users-value">
                                                        {user.APELLIDO_DOCENTE}
                                                    </span>
                                                </div>
                                                <div className="approve-users-info-item">
                                                    <span className="approve-users-label">
                                                        Correo
                                                    </span>
                                                    <span className="approve-users-value">
                                                        {user.EMAIL_DOCENTE}
                                                    </span>
                                                </div>
                                            </div>
                                            {user.isAdmin ? (
                                                <p className="already-admin">
                                                    Ya es administrador
                                                </p>
                                            ) : (
                                                <button
                                                    className="change-photo-btn"
                                                    onClick={() =>
                                                        handleAssignAdmin(
                                                            user.ID_DOCENTE
                                                        )
                                                    }
                                                >
                                                    Hacer Admin
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="approve-users-no-pending">
                                        No hay usuarios pendientes de
                                        aprobación.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ApproveAccounts;
