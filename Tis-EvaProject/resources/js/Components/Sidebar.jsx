import React from "react";

const Sidebar = ({ isSidebarCollapsed, toggleSidebar }) => {
    return (
        <aside
                    className={`sidebar ${
                        isSidebarCollapsed ? "collapsed" : ""
                    }`}
                >
                    <div className="sidebar-header">
                        <div className="project-icon">
                            <i className="fas fa-project-diagram"></i>
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="project-info">
                                <h3>
                                    Sistema de Evaluación Basada en Proyectos
                                </h3>
                            </div>
                        )}
                    </div>
                    <hr className="divisor-side" />
                    <ul className="sidebar-menu">
                        <li className="menu-item">
                            <i className="fas fa-tasks icon-menu"></i>
                            <span className="menu-text">Product Backlog</span>
                        </li>
                        <li className="menu-item">
                            <i className="fas fa-users icon-menu"></i>
                            <span className="menu-text">Equipo</span>
                        </li>
                        <li className="menu-item">
                            <i className="fas fa-book-open icon-menu"></i>
                            <span className="menu-text">Tareas</span>
                        </li>
                    </ul>
                    <hr className="divisor-side" />
                    <button
                        className="sidebar-collapse"
                        onClick={toggleSidebar}
                    >
                        <i
                            className={`fas ${
                                isSidebarCollapsed
                                    ? "fa-angle-right"
                                    : "fa-angle-left"
                            }`}
                        ></i>
                    </button>
                </aside>
    );
};

export default Sidebar;
