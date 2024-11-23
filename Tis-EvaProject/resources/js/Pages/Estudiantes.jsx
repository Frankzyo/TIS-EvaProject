import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderProyecto from "../Components/HeaderProyecto";
import SidebarPrueba from "../Components/SidebarPrueba";
import "../../css/Proyectos.css";
import "../../css/Estudiantes.css";
import "../../css/HeaderProyecto.css";
import "../../css/Loader.css";
import "../../css/SidebarPrueba.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ModalError from "../Components/ModalError";

const Estudiantes = () => {
    const { groupId, projectId } = useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const [groupInfo, setGroupInfo] = useState(null);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [students, setStudents] = useState([]);
    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    // Redirigir si el usuario no es un docente
    useEffect(() => {
        const role = localStorage.getItem("ROLE");
        const docenteId = localStorage.getItem("ID_DOCENTE");

        if (role !== "Docente" || !docenteId) {
            navigate("/login");
        }
    }, [navigate]);

    // Cargar detalles del proyecto
    useEffect(() => {
        fetch(`http://localhost:8000/api/proyectos/${projectId}`)
            .then((response) => response.json())
            .then((data) => {
                setProjectDetails(data);
            })
            .catch((error) => console.error("Error al cargar el proyecto:", error));
    }, [projectId]);

    // Cargar los datos del grupo
    useEffect(() => {
        fetch(`http://localhost:8000/api/grupos/${groupId}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.message === "No autorizado" || data.message === "Grupo no encontrado o no autorizado") {
                    console.error(data.message);
                } else {
                    setGroupInfo(data);
                }
            })
            .catch((error) => console.error("Error al cargar el grupo:", error));
    }, [groupId]);

    // Cargar la lista de estudiantes en el grupo
    const fetchStudents = () => {
        fetch(`http://localhost:8000/api/estudiantes?ID_GRUPO=${groupId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error al cargar estudiantes");
                }
                return response.json();
            })
            .then((data) => {
                setStudents(data);
            })
            .catch((error) => {
                console.error("Error al cargar estudiantes:", error);
                setErrorMessage("Error al cargar estudiantes");
                setShowErrorMessage(true);
            });
    };

    useEffect(() => {
        fetchStudents();
    }, [groupId]);

    return (
        <div className="estudiantes-page">
            {/* Header */}
            <HeaderProyecto />

            <div className="estudiantes-layout">
                {/* Sidebar */}
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                />

                {/* Contenido principal */}
                <div className="estudiantes-content">
                    {groupInfo && (
                        <div className="group-info-section">
                            <img
                                src={groupInfo.PORTADA_GRUPO ? `http://localhost:8000/storage/${groupInfo.PORTADA_GRUPO}` : "https://via.placeholder.com/150"}
                                alt="Icono del grupo"
                                className="group-image"
                            />
                            <div className="group-info-text">
                                <h2 className="group-title">{groupInfo.NOMBRE_GRUPO}</h2>
                                <p className="group-description">{groupInfo.DESCRIP_GRUPO || "Descripción no disponible"}</p>
                            </div>
                        </div>
                    )}

                    <div className="divisor-container">
                        <div className="divisor-est"></div>
                    </div>

                    <div className="estudiantes-container">
                        <div className="container">
                            <div className="projects-header">
                                <h2>Estudiantes</h2>
                            </div>

                            <div className="project-list">
                                {students.map((student, index) => (
                                    <div key={index} className="project-item">
                                        <img
                                            src={student.FOTO_EST ? `http://localhost:8000/storage/${student.FOTO_EST}` : "https://via.placeholder.com/50"}
                                            alt="Foto del estudiante"
                                            className="student-photo"
                                            width="50"
                                            height="50"
                                        />

                                        <div className="project-info">
                                            <h3>{`${student.NOMBRE_EST || ""} ${student.APELLIDO_EST || ""}`.trim()}</h3>
                                            <p>{student.EMAIL_EST}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Modal de error */}
                    {showErrorMessage && (
                        <ModalError
                            errorMessage={errorMessage}
                            closeModal={() => setShowErrorMessage(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Estudiantes;
