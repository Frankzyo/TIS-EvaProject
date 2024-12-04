import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/EstilosSidebar/SidebarPrueba.css";

const SidebarPrueba = ({
    isSidebarCollapsed,
    toggleSidebar,
    nombreProyecto,
    fotoProyecto,
    projectId, // Recibe el projectId como prop
}) => {
    const navigate = useNavigate();
    const [isDropdownOpen1, setIsDropdownOpen1] = useState(false);
    const [isDropdownOpen2, setIsDropdownOpen2] = useState(false);
    const [isDropdownOpen3, setIsDropdownOpen3] = useState(false);

    const toggleDropdown1 = () => setIsDropdownOpen1(!isDropdownOpen1);
    const toggleDropdown2 = () => setIsDropdownOpen2(!isDropdownOpen2);
    const toggleDropdown3 = () => setIsDropdownOpen3(!isDropdownOpen3);

    return (
        <aside
            className={`sidebar-prueba ${
                isSidebarCollapsed ? "collapsed" : ""
            }`}
        >
            <div className="sidebar-prueba-header">
                <div className="project-icon-prueba">
                    {fotoProyecto ? (
                        <img
                            src={fotoProyecto}
                            alt="Proyecto"
                            className="project-photo-prueba"
                        />
                    ) : (
                        <i className="fas fa-project-diagram"></i>
                    )}
                </div>
                {!isSidebarCollapsed && (
                    <div className="project-info-prueba">
                        <h3>{nombreProyecto}</h3>
                    </div>
                )}
            </div>
            <hr className="divisor-side-prueba" />
            <ul className="sidebar-prueba-menu">
                {/* Equipos */}
                <li
                    className="menu-item-prueba"
                    onClick={() => navigate(`/grupos/${projectId}`)}
                >
                    <i className="fas fa-file-signature icon-menu-prueba"></i>
                    <span className="menu-text-prueba">Equipos</span>
                </li>
                {/* Requerimientos */}
                <li
                    className="menu-item-prueba"
                    onClick={() => navigate(`/requerimientos/${projectId}`)}
                >
                    <i className="fas fa-clipboard-list icon-menu-prueba"></i>
                    <span className="menu-text-prueba">Requerimientos</span>
                </li>
                <li
                    className="menu-item-prueba"
                    onClick={() => navigate(`/etapas-proyecto/${projectId}`)}
                >
                    <i className="fas fa-tasks icon-menu-prueba"></i>
                    <span className="menu-text-prueba">Etapas y Rubrica</span>
                </li>

                {/* Planilla de seguimiento */}
                <li
                    className="menu-item-prueba"
                    onClick={() =>
                        navigate(`/planilla-seguimiento/${projectId}`)
                    }
                >
                    <i className="fas fa-paste icon-menu-prueba"></i>
                    <span className="menu-text-prueba">
                        Planilla de Seguimiento
                    </span>
                </li>

                {/* Evaluaciones con Dropdown */}
                <li className="menu-item-prueba" onClick={toggleDropdown1}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <i className="fas fa-newspaper icon-menu-prueba"></i>
                        <span className="menu-text-prueba">Evaluaciones</span>
                    </div>
                    <i
                        className={`fas ${
                            isDropdownOpen1 ? "fa-angle-up" : "fa-angle-down"
                        } ${isSidebarCollapsed ? "hidden-icon" : ""}`}
                    ></i>
                </li>
                {isDropdownOpen1 && !isSidebarCollapsed && (
                    <div className="submenu">
                        <ul
                            className="menu-item-prueba"
                            onClick={() =>
                                navigate(`/evaluacion-individual/${projectId}`)
                            }
                        >
                            <i className="fas fa-user icon-menu-prueba"></i>
                            <span className="menu-text-prueba">
                                Evaluación Individual
                            </span>
                        </ul>
                        <ul
                            className="menu-item-prueba"
                            onClick={() =>
                                navigate(`/evaluacion-de-pares/${projectId}`)
                            }
                        >
                            <i className="fas fa-users icon-menu-prueba"></i>
                            <span className="menu-text-prueba">
                                Evaluación de Pares
                            </span>
                        </ul>
                        <ul
                            className="menu-item-prueba"
                            onClick={() =>
                                navigate(`/evaluacion-cruzada/${projectId}`)
                            }
                        >
                            <i className="fas fa-random icon-menu-prueba"></i>
                            <span className="menu-text-prueba">
                                Evaluación Cruzada
                            </span>
                        </ul>
                    </div>
                )}

                {/* Seguimiento y reportes con Dropdown */}
                <li className="menu-item-prueba" onClick={toggleDropdown2}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <i className="fas fa-window-restore icon-menu-prueba"></i>
                        <span className="menu-text-prueba">
                            Seguimientos y Reportes
                        </span>
                    </div>
                    <i
                        className={`fas ${
                            isDropdownOpen2 ? "fa-angle-up" : "fa-angle-down"
                        } ${isSidebarCollapsed ? "hidden-icon" : ""}`}
                    ></i>
                </li>
                {isDropdownOpen2 && !isSidebarCollapsed && (
                    <div className="submenu">
                        <ul
                            className="menu-item-prueba"
                            onClick={() => navigate(`/seguimiento-semanal/${projectId}`)}
                        >
                            <span className="menu-text-prueba">
                                Seguimientos semanal
                            </span>
                        </ul>
                        <ul
                            className="menu-item-prueba"
                            onClick={() => navigate("/historial-evaluaciones")}
                        >
                            <span className="menu-text-prueba">
                                Historial de evaluaciones
                            </span>
                        </ul>
                        <ul
                            className="menu-item-prueba"
                            onClick={() => navigate("/generar-reportes")}
                        >
                            <span className="menu-text-prueba">
                                Generar reportes
                            </span>
                        </ul>
                    </div>
                )}

                {/* Asistencia con Dropdown */}
                <li className="menu-item-prueba" onClick={toggleDropdown3}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <i className="fas fa-users-rectangle icon-menu-prueba"></i>
                        <span className="menu-text-prueba">Asistencia</span>
                    </div>
                    <i
                        className={`fas ${
                            isDropdownOpen3 ? "fa-angle-up" : "fa-angle-down"
                        } ${isSidebarCollapsed ? "hidden-icon" : ""}`}
                    ></i>
                </li>
                {isDropdownOpen3 && !isSidebarCollapsed && (
                    <div className="submenu">
                        <ul
                            className="menu-item-prueba"
                            onClick={() => navigate("/registro-asistencia")}
                        >
                            <span className="menu-text-prueba">
                                Registro de asistencia
                            </span>
                        </ul>
                    </div>
                )}
            </ul>
            <hr className="divisor-side-prueba" />
            <button className="sidebar-prueba-collapse" onClick={toggleSidebar}>
                <span className="sidebar-prueba-circle" aria-hidden="true">
                    <span className="sidebar-prueba-icon sidebar-prueba-arrow">
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

export default SidebarPrueba;
