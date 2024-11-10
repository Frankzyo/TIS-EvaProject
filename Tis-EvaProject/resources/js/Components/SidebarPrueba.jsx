import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/SidebarPrueba.css";

const SidebarPrueba = ({
    isSidebarCollapsed,
    toggleSidebar,
    nombreProyecto,
    fotoProyecto,
    projectId, // Recibe el projectId como prop
    cambiarVista,
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
                    onClick={() => cambiarVista("Equipos")}
                >
                    <i className="fas fa-user-group icon-menu-prueba"></i>
                    <span className="menu-text-prueba">Equipos</span>
                </li>

                {/* Planilla de seguimiento */}
                <li
                    className="menu-item-prueba"
                    onClick={() => cambiarVista("PlanillaSeguimiento")}
                >
                    <i className="fas fa-paste icon-menu-prueba"></i>
                    <span className="menu-text-prueba">
                        Planilla de seguimiento
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
                            onClick={() => navigate("/rubrica-evaluacion")}
                        >
                            <span className="menu-text-prueba">
                                Rubrica de evaluacion
                            </span>
                        </ul>
                        <ul
                            className="menu-item-prueba"
                            onClick={() => navigate("/registrar-evaluaciones")}
                        >
                            <span className="menu-text-prueba">
                                Registrar Evaluaciones
                            </span>
                        </ul>
                        <ul
                            className="menu-item-prueba"
                            onClick={() => cambiarVista("TipoEvaluaciones")}
                        >
                            <span className="menu-text-prueba">
                                Tipo de Evaluacion
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
                            Seguimientos y reportes
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
                            onClick={() => navigate("/seguimiento-semanal")}
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
