import React from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/EstilosSidebar/SidebarEstudiante.css";

const SidebarEstudiante = ({
    isSidebarCollapsed,
    toggleSidebar,
    nombreProyecto,
    fotoProyecto,
    projectId,
    groupId,
    isRepresentanteLegal,
}) => {
    const navigate = useNavigate();

    return (
        <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
                <div className="project-icon">
                    {fotoProyecto ? (
                        <img
                            src={fotoProyecto}
                            alt="Proyecto"
                            className="project-photo"
                        />
                    ) : (
                        <i className="fas fa-folder-open"></i>
                    )}
                </div>
                {!isSidebarCollapsed && (
                    <div className="project-info">
                        <h3>{nombreProyecto || "Proyecto Actual"}</h3>
                    </div>
                )}
            </div>
            <hr className="divisor-side" />
            <ul className="sidebar-menu">
                {/* Opciones solo para el Representante Legal */}
                {isRepresentanteLegal && (
                    <>
                        <li
                            className="menu-item"
                            onClick={() => navigate("/proyecto-estudiante")}
                        >
                            <i className="fas fa-cog icon-menu"></i>
                            <span className="menu-text">
                                Administrar Proyecto
                            </span>
                        </li>
                    </>
                )}
                {/* Opciones accesibles para todos los estudiantes */}
                <li
                    className="menu-item"
                    onClick={() => navigate("/planificacion-estudiante")}
                >
                    <i className="fas fa-clipboard-list icon-menu"></i>
                    <span className="menu-text">Backlog</span>
                </li>
                <li
                    className="menu-item"
                    onClick={() => navigate("/equipo-estudiante")}
                >
                    <i className="fas fa-users-cog icon-menu"></i>
                    <span className="menu-text">Equipo</span>
                </li>
                <li
                    className="menu-item"
                    onClick={() => navigate("/tareas-estudiante")}
                >
                    <i className="fas fa-tasks icon-menu"></i>
                    <span className="menu-text">Tareas</span>
                </li>
                {/* Nueva opción para Seguimiento Semanal */}
                <li
                    className="menu-item"
                    onClick={() =>
                        navigate(`/seguimiento-semanal-estudiante/${projectId}`)
                    }
                >
                    <i className="fas fa-calendar-check icon-menu"></i>
                    <span className="menu-text">Seguimiento Semanal</span>
                </li>
            </ul>
            <hr className="divisor-side" />
            <button className="sidebar-collapse" onClick={toggleSidebar}>
                <span className="sidebar-circle" aria-hidden="true">
                    <span className="sidebar-icon sidebar-prueba-arrow">
                        <i
                            className={`fas ${
                                isSidebarCollapsed
                                    ? "fa-angle-right"
                                    : "fa-angle-left"
                            }`}
                        ></i>
                    </span>
                </span>
            </button>
        </aside>
    );
};

export default SidebarEstudiante;
