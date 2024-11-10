import React, { useState, useEffect, useRef } from "react";
import "../../css/Proyectos.css";

const HeaderProyecto = ({ isModalOpen }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userData, setUserData] = useState({
        nombre: "Usuario",
        email: "usuario@correo.com",
        foto: "https://via.placeholder.com/50",
        isAdmin: false, // Indica si el usuario es administrador
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
                        isAdmin: data.is_admin, // Asignamos si es administrador
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

    // Función para manejar las opciones del dropdown
    // Función para manejar las opciones del dropdown
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
            window.location.href = "/perfil";
        } else if (option === "projects") {
            window.location.href = "/proyectos"; // Redirección a la página de proyectos
        } else if (option === "approveUsers" && userData.isAdmin) {
            window.location.href = "/approve-accounts";
        }
    
        setIsDropdownOpen(false);
    };
    

    return (
        <div className={`header ${isModalOpen ? "disabled" : ""}`}>
            <div className="logo"></div>
            <div
                className="user-icon-container"
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
            >
                <img
                    src={userData.foto}
                    alt="Foto de perfil"
                    className="profile-image"
                    onClick={() => handleOptionClick("profile")}
                />
                <i className="fas fa-chevron-down dropdown-icon"></i>
            </div>

            {isDropdownOpen && (
                <div
                    className="dropdown-menu"
                    ref={dropdownRef}
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
                        {/* Solo mostrar "Aprobar Usuarios" si el usuario es administrador */}
                        {userData.isAdmin ? (
                            <li
                                className="dropdown-button"
                                onClick={() =>
                                    handleOptionClick("approveUsers")
                                }
                            >
                                Aprobar Usuarios
                            </li>
                        ) : null}
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
