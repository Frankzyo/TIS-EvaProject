import React, { useState } from "react";
const SidebarDocente = ({
    isSidebarCollapsed,
    toggleSidebar,
    imageProject,
    cambiarVista,
}) => {
    const [isDropdownOpen1, setIsDropdownOpen1] = useState(false);
    const [isDropdownOpen2, setIsDropdownOpen2] = useState(false);
    const [isDropdownOpen3, setIsDropdownOpen3] = useState(false);
    const toggleDropdown1 = () => {
        setIsDropdownOpen1(!isDropdownOpen1);
    };
    const toggleDropdown2 = () => {
        setIsDropdownOpen2(!isDropdownOpen2);
    };
    const toggleDropdown3 = () => {
        setIsDropdownOpen3(!isDropdownOpen3);
    };
    return (
        <aside className={`dc-sb ${isSidebarCollapsed ? "collapsed" : ""}`}>
            <div className="dc-hd">
                <div className="dc-pic">
                    <img
                        src={`http://localhost:8000/storage/${imageProject}`}
                        alt="Project Image"
                    />
                </div>
                {!isSidebarCollapsed && (
                    <div className="dc-info">
                        <h3>Sistema de Evaluación Basada en Proyectos</h3>
                    </div>
                )}
            </div>
            <hr className="dc-div" />
            <ul className="dc-mn">
                <li onClick={() => cambiarVista("Equipos")} className="dc-it">
                    <i className="fa-solid fa-user-group dc-ic"></i>
                    <span className="dc-txt">Equipo</span>
                </li>
                <li
                    onClick={() => cambiarVista("PlanillaSeguimiento")}
                    className="dc-it"
                >
                    <i className="fa-solid fa-paste dc-ic"></i>
                    <span className="dc-txt">Planilla de seguimiento</span>
                </li>
                <li className="dc-it-i" onClick={toggleDropdown1}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <i className="fa-solid fa-newspaper dc-ic"></i>
                        <span className="dc-txt">Evaluaciones</span>
                    </div>

                    <i
                        className={`fas ${
                            isDropdownOpen1 ? "fa-angle-up" : "fa-angle-down"
                        }${isSidebarCollapsed ? "hidden-icon" : ""}`}
                    ></i>
                </li>
                {isDropdownOpen1 && (
                    <>
                        <div style={{ width: "100%" }}>
                            <ul className="dc-it">
                                <span className="dc-txt-2">
                                    Registro de evaluacion
                                </span>
                            </ul>
                            <ul className="dc-it">
                                <span className="dc-txt-2">
                                    Registrar evaluaciones
                                </span>
                            </ul>
                            <ul className="dc-it">
                                <span className="dc-txt-2">
                                    Tipo evaluacion
                                </span>
                            </ul>
                        </div>
                    </>
                )}
                <li className="dc-it-i" onClick={toggleDropdown2}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <i className="fa-solid fa-window-restore dc-ic"></i>
                        <span className="dc-txt">Seguimiento y reportes</span>
                    </div>
                    <i
                        className={`fas ${
                            isDropdownOpen2 ? "fa-angle-up" : "fa-angle-down"
                        }${isSidebarCollapsed ? "hidden-icon" : ""}`}
                    ></i>
                </li>
                {isDropdownOpen2 && (
                    <>
                        <div style={{ width: "100%" }}>
                            <ul className="dc-it">
                                <span className="dc-txt-2">
                                    Seguimiento semanal
                                </span>
                            </ul>
                            <ul className="dc-it">
                                <span className="dc-txt-2">
                                    Historial de evaluaciones
                                </span>
                            </ul>
                            <ul className="dc-it">
                                <span className="dc-txt-2">
                                    Generar reportes
                                </span>
                            </ul>
                        </div>
                    </>
                )}
                <li className="dc-it-i" onClick={toggleDropdown3}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <i className="fa-solid fa-users-rectangle dc-ic"></i>
                        <span className="dc-txt">Asistencia</span>
                    </div>
                    <i
                        className={`fas ${
                            isDropdownOpen3 ? "fa-angle-up" : "fa-angle-down"
                        } ${isSidebarCollapsed ? "hidden-icon" : ""}`}
                    ></i>
                </li>
                {isDropdownOpen3 && (
                    <>
                        <div style={{ width: "100%" }}>
                            <ul className="dc-it">
                                <span className="dc-txt-2">
                                    Registro de asistencia
                                </span>
                            </ul>
                        </div>
                    </>
                )}
            </ul>
            <hr className="dc-div" />
            <button className="dc-cl" onClick={toggleSidebar}>
                <i
                    className={`fas ${
                        isSidebarCollapsed ? "fa-angle-right" : "fa-angle-left"
                    }`}
                ></i>
            </button>
        </aside>
    );
};

export default SidebarDocente;
