import React, { useState } from "react";
import "../../css/Proyectos.css";

const HeaderProyecto = ({ isModalOpen }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const profileImageUrl = localStorage.getItem('PROFILE_IMAGE') || 'https://via.placeholder.com/50';

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleOptionClick = (option) => {
        if (option === "logout") {
            const role = localStorage.getItem("ROLE"); // Obtener el rol del usuario

            // Solicitud de logout al backend
            fetch("http://localhost:8000/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
                },
                body: JSON.stringify({ role }), // Enviar el rol en el body
                credentials: "include", // Asegura que las cookies de sesión se envíen con la solicitud
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al cerrar sesión");
                }
                return response.json();
            })
            .then(() => {
                // Eliminar los datos del usuario del almacenamiento local
                localStorage.removeItem("ID_DOCENTE");
                localStorage.removeItem("ID_ESTUDIANTE");
                localStorage.removeItem("PROFILE_IMAGE");
                localStorage.removeItem("ROLE");

                // Redirigir a la página de inicio
                window.location.href = "/";
            })
            .catch((error) => console.error("Error al cerrar sesión:", error));
        } else if (option === "profile") {
            window.location.href = "/perfil";
        }
        setIsDropdownOpen(false);
    };

    const goToProfile = () => {
        window.location.href = "/perfil";
    };

    return (
        <div className={`header ${isModalOpen ? "disabled" : ""}`}>
            <div className="logo"></div>
            <div className="user-icon-container">
                <img
                    src={profileImageUrl}
                    alt="Foto de perfil"
                    className="profile-image"
                    onClick={goToProfile}
                />
                <i className="fas fa-chevron-down dropdown-icon" onClick={toggleDropdown}></i>
            </div>

            {isDropdownOpen && (
                <div className="dropdown-menu">
                    <button className="dropdown-button" onClick={() => handleOptionClick("profile")}>
                        Perfil
                    </button>
                    <button className="dropdown-button" onClick={() => handleOptionClick("settings")}>
                        Configuración
                    </button>
                    <button className="dropdown-button" onClick={() => handleOptionClick("logout")}>
                        Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    );
};

export default HeaderProyecto;
