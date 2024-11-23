import React, { useState, useEffect, useRef } from "react";
import "../../css/HeaderEstudiante.css";

const HeaderEstudiante = ({ isModalOpen }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userData, setUserData] = useState({
        nombre: "Usuario",
        email: "usuario@correo.com",
        foto: "https://via.placeholder.com/50",
        isRL: false, // Indica si el usuario es Representante Legal
    });

    const dropdownRef = useRef(null);
    const closeTimeoutRef = useRef(null);

    // Función para obtener los datos del usuario logueado
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
                        isRL: Boolean(data.is_rl), // Asegura que se trate como booleano
                    });
                }
            })
            .catch((error) =>
                console.error("Error al cargar los datos del usuario:", error)
            );
    }, []);

    // Función para alternar el menú desplegable
    const toggleDropdown = () => {
        setIsDropdownOpen((prevState) => !prevState);
    };

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
        }, 300); // Ajusta el tiempo según sea necesario
    };

    const handleOptionClick = async (option) => {
        if (option === "logout") {
            const role = localStorage.getItem("ROLE");
            const logoutUrl = role === "Docente" ? "/docente/logout" : "/estudiante/logout";

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

                // Limpia el almacenamiento local y redirige al login
                localStorage.clear();
                window.location.href = "/login";
            } catch (error) {
                console.error("Error al cerrar sesión:", error);
            }
        } else if (option === "profile") {
            window.location.href = "/perfil-estudiante";
        } else if (option === "backlog") {
            window.location.href = "/planificacion-estudiante"; // Redirección a la página de proyectos
        }

        setIsDropdownOpen(false);
    };

    return (
        <div className={`header-est ${isModalOpen ? "disabled" : ""}`}>
            <div className="logo-est"></div>
            <div
                className="user-icon-container-est"
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
            >
                <img
                    src={userData.foto}
                    alt="Foto de perfil"
                    className="profile-image-est"
                    onClick={() => handleOptionClick("profile")}
                />
                <i className="fas fa-chevron-down dropdown-icon"></i>
            </div>

            {isDropdownOpen && (
                <div
                    className="dropdown-menu-est"
                    ref={dropdownRef}
                    onMouseEnter={openDropdown}
                    onMouseLeave={closeDropdown}
                >
                    <div className="dropdown-header-est">
                        <div className="profile-container">
                            <img
                                src={userData.foto}
                                alt="Foto de perfil"
                                className="perfil-image-est"
                            />
                            <div className="profile-info-est">
                                <span className="user-name-est">
                                    {userData.nombre}
                                </span>
                                <span className="user-email-est">
                                    {userData.email}
                                </span>
                                <span className="user-role-est">Estudiante</span>
                                {userData.isRL && (
                                    <span className="user-role-est">
                                        Representante Legal
                                    </span>
                                )}
                                <button
                                    className="edit-profile-button-est"
                                    onClick={() => handleOptionClick("profile")}
                                >
                                    Editar perfil
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="dropdown-divider-est"></div>
                    <ul className="dropdown-options-est">
                        <li
                            className="dropdown-button-est"
                            onClick={() => handleOptionClick("settings")}
                        >
                            Configuración de cuenta
                        </li>
                        <li
                            className="dropdown-button-est"
                            onClick={() => handleOptionClick("notifications")}
                        >
                            Notificaciones
                        </li>
                        <li
                            className="dropdown-button-est"
                            onClick={() => handleOptionClick("backlog")}
                        >
                            Backlog
                        </li>
                    </ul>
                    <div className="dropdown-divider-est"></div>
                    <button
                        className="logout-button-est"
                        onClick={() => handleOptionClick("logout")}
                    >
                        Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    );
};

export default HeaderEstudiante;
