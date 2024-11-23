import React, { useState, useEffect, useRef } from "react";
import "../../css/Proyectos.css";

const HeaderProyecto = ({ isModalOpen }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userData, setUserData] = useState({
        nombre: "Usuario",
        email: "usuario@correo.com",
        foto: "https://via.placeholder.com/50",
        isAdmin: false,
    });

    const closeTimeoutRef = useRef(null);
    const [pendingStudents, setPendingStudents] = useState([]);
    const [pendingTeachers, setPendingTeachers] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8000/api/usuario-logueado", {
            credentials: "include",
        })
            .then((response) => response.json())
            .then((data) => {
                if (!data.error) {
                    setUserData({
                        nombre: `${data.nombre} ${data.apellido}`,
                        email: data.email,
                        foto: data.foto
                            ? `http://localhost:8000/storage/${data.foto}`
                            : "https://via.placeholder.com/50",
                        isAdmin: Boolean(data.is_admin),
                    });
                }
            })
            .catch((error) =>
                console.error("Error al cargar los datos del usuario:", error)
            );
    }, []);

    useEffect(() => {
        const obtenerSolicitudesPendientes = async () => {
            try {
                const token = localStorage.getItem("token");
    
                const studentResponse = await fetch(
                    "http://localhost:8000/api/pending-students",
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Accept": "application/json"
                        },
                        credentials: "include"
                    }
                );
    
                const teacherResponse = await fetch(
                    "http://localhost:8000/api/pending-teachers",
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Accept": "application/json"
                        },
                        credentials: "include"
                    }
                );
    
                // Verifica el status de la respuesta antes de intentar parsearla como JSON
                if (
                    studentResponse.ok &&
                    studentResponse.headers
                        .get("content-type")
                        ?.includes("application/json")
                ) {
                    const studentData = await studentResponse.json();
                    setPendingStudents(studentData);
                } else {
                    console.error(
                        `La respuesta de pending-students no es JSON o tuvo un error: ${studentResponse.status}`
                    );
                }
    
                if (
                    teacherResponse.ok &&
                    teacherResponse.headers
                        .get("content-type")
                        ?.includes("application/json")
                ) {
                    const teacherData = await teacherResponse.json();
                    setPendingTeachers(teacherData);
                } else {
                    console.error(
                        `La respuesta de pending-teachers no es JSON o tuvo un error: ${teacherResponse.status}`
                    );
                }
            } catch (error) {
                console.error(
                    "Error al obtener solicitudes pendientes:",
                    error
                );
            }
        };
    
        obtenerSolicitudesPendientes();
    }, []);
    

    const openDropdown = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setIsDropdownOpen(true);
    };

    const closeDropdown = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setIsDropdownOpen(false);
        }, 300); // Retraso de 300 ms para cerrar el menú
    };

    const handleOptionClick = async (option) => {
        if (option === "logout") {
            const role = localStorage.getItem("ROLE");
            const logoutUrl =
                role === "Docente" ? "/docente/logout" : "/estudiante/logout";
    
            try {
                const csrfToken = document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute("content");
    
                const response = await fetch(logoutUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                    },
                    credentials: "include",
                });
    
                if (!response.ok) {
                    throw new Error("Error al cerrar sesión");
                }
    
                localStorage.clear();
                window.location.href = "/login";
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
            }
        } else if (option === "profile") {
            window.location.href = "/perfil";
        } else if (option === "projects") {
            window.location.href = "/proyectos";
        } else if (option === "approveUsers" && userData.isAdmin) {
            window.location.href = "/approve-accounts";
        } else if (option === "approveStudent") { // Cualquier docente puede aprobar estudiantes
            window.location.href = "/approve-estudiante";
        }
    
        setIsDropdownOpen(false);
    };
    

    const totalPending = pendingStudents.length + pendingTeachers.length;

    return (
        <div className={`header ${isModalOpen ? "disabled" : ""}`}>
            <div className="logo"></div>
            <div
                className="user-icon-container"
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
            >
                <div className="profile-image-wrapper">
                    <img
                        src={userData.foto}
                        alt="Foto de perfil"
                        className="profile-image"
                        onClick={() => handleOptionClick("profile")}
                    />
                    {totalPending > 0 && (
                        <div className="notification-badge">{totalPending}</div>
                    )}
                </div>
                <i className="fas fa-chevron-down dropdown-icon"></i>
            </div>

            {isDropdownOpen && (
                <div
                    className="dropdown-menu"
                    onMouseEnter={openDropdown}
                    onMouseLeave={closeDropdown}
                >
                    <div className="dropdown-header">
                        <div className="profile-container">
                            <img
                                src={userData.foto}
                                alt="Foto de perfil"
                                className="perfil-image"
                            />
                            <div className="profile-info">
                                <span className="user-name">
                                    {userData.nombre}
                                </span>
                                <span className="user-email">
                                    {userData.email}
                                </span>
                                <span className="user-role">Docente</span>
                                {userData.isAdmin && (
                                    <span className="user-role">
                                        Administrador
                                    </span>
                                )}
                                <button
                                    className="edit-profile-button"
                                    onClick={() => handleOptionClick("profile")}
                                >
                                    Editar perfil
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <ul className="dropdown-options">
                        <li
                            className="dropdown-button"
                            onClick={() => handleOptionClick("settings")}
                        >
                            Configuración de cuenta
                        </li>
                        <li
                            className="dropdown-button"
                            onClick={() => handleOptionClick("notifications")}
                        >
                            Notificaciones
                        </li>
                        <li
                            className="dropdown-button"
                            onClick={() => handleOptionClick("projects")}
                        >
                            Proyectos
                        </li>
                        <li
                            className="dropdown-button"
                            onClick={() => handleOptionClick("approveStudent")}
                        >
                            Aprobar Estudiantes
                            {pendingStudents.length > 0 && (
                                <span className="menu-notification-badge">
                                    {pendingStudents.length}
                                </span>
                            )}
                        </li>
                        {userData.isAdmin && (
                            <li
                                className="dropdown-button"
                                onClick={() =>
                                    handleOptionClick("approveUsers")
                                }
                            >
                                Aprobar Docentes
                                {pendingTeachers.length > 0 && (
                                    <span className="menu-notification-badge">
                                        {pendingTeachers.length}
                                    </span>
                                )}
                            </li>
                        )}
                    </ul>
                    <div className="dropdown-divider"></div>
                    <button
                        className="logout-button"
                        onClick={() => handleOptionClick("logout")}
                    >
                        Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    );
};

export default HeaderProyecto;
