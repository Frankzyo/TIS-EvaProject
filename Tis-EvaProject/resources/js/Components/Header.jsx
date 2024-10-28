import React from "react";
import "../../css/PlanificacionEstudiante.css"; // Asegúrate de ajustar la ruta del CSS si está en otra ubicación.

const Header = () => {
    return (
        <div className="header-planificacion">
                <div className="logo"></div>
                <div className="iconos-usuario-planificacion">
                    <i className="fas fa-user-circle icono-usuario"></i>
                    <i className="fas fa-chevron-down icono-dropdown"></i>
                </div>
            </div>
    );
};

export default Header;
