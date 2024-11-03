import React from "react";
import { useNavigate } from "react-router-dom";
import "../../css/SidebarEstudiante.css";

const SidebarEstudiante = ({ isSidebarCollapsed, toggleSidebar, nombreProyecto, fotoProyecto }) => {
    const navigate = useNavigate();

    return (
        <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
                <div className="project-icon">
                    {fotoProyecto ? (
                        <img src={fotoProyecto} alt="Proyecto" className="project-photo" />
                    ) : (
                        <i className="fas fa-project-diagram"></i>
                    )}
                </div>
                {!isSidebarCollapsed && (
                    <div className="project-info">
                        <h3>{nombreProyecto || ""}</h3>
                    </div>
                )}
            </div>
            <hr className="divisor-side" />
            <ul className="sidebar-menu">
                <li className="menu-item" onClick={() => navigate('/planificacion-estudiante')}>
                    <i className="fas fa-tasks icon-menu"></i>
                    <span className="menu-text">Backlog</span>
                </li>
                <li className="menu-item" onClick={() => navigate('/equipo-estudiante')}>
                    <i className="fas fa-users icon-menu"></i>
                    <span className="menu-text">Equipo</span>
                </li>
                <li className="menu-item" onClick={() => navigate('/tareas-estudiante')}>
                    <i className="fas fa-book-open icon-menu"></i>
                    <span className="menu-text">Tareas</span>
                </li>
            </ul>
            <hr className="divisor-side" />
            <button className="sidebar-collapse" onClick={toggleSidebar}>
                <i className={`fas ${isSidebarCollapsed ? "fa-angle-right" : "fa-angle-left"}`}></i>
            </button>
        </aside>
    );
};

export default SidebarEstudiante;
