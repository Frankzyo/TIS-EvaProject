import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/HeaderEstudiante";
import ModalError from "../Components/ModalError";
import "../../css/ProyectoEstudiante.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

const ProyectoEstudiante = () => {
    const [projects, setProjects] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isRL, setIsRL] = useState(false);
    const [registeredProjectId, setRegisteredProjectId] = useState(null); // ID del proyecto registrado actualmente
    const [showErrorModal, setShowErrorModal] = useState(false); // Estado para el modal de error
    const [errorMessage, setErrorMessage] = useState(""); // Mensaje de error para el modal
    const navigate = useNavigate();
    
    useEffect(() => {
        const studentId = localStorage.getItem("ID_EST");
        const isRepresentative = localStorage.getItem("IS_RL") === "true";
        setIsRL(isRepresentative);

        if (!studentId) {
            console.error(
                "El ID del estudiante no está disponible. Redirigiendo al inicio de sesión."
            );
            setSuccessMessage(
                "Error: No se pudo cargar el ID del estudiante. Por favor, inicie sesión nuevamente."
            );
            navigate("/login");
            return;
        }

        // Llamada para obtener el proyecto registrado del estudiante, si existe
        axios
            .get(
                `http://localhost:8000/api/students/${studentId}/registered-project`
            )
            .then((response) => {
                setRegisteredProjectId(response.data.projectId); // Asume que `projectId` es el ID del proyecto registrado
            })
            .catch((error) => {
                console.error(
                    "Error al obtener el proyecto registrado:",
                    error
                );
            });

        // Llamada a la API para obtener todos los proyectos
        axios
            .get("http://localhost:8000/api/projects/all")
            .then((response) => {
                setProjects(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error al obtener los proyectos:", error);
                setIsLoading(false);
            });
    }, [navigate]);

    const handleRegister = (projectId) => {
        const studentId = localStorage.getItem("ID_EST");

        if (!studentId) {
            console.error("Error: el ID del estudiante no está disponible.");
            setSuccessMessage(
                "Error: No se pudo registrar. Por favor, inicie sesión nuevamente."
            );
            return;
        }

        axios
            .post(
                `http://localhost:8000/api/students/register-to-project/${projectId}`,
                {
                    student_id: studentId,
                }
            )
            .then((response) => {
                setSuccessMessage(
                    "¡Te has registrado exitosamente en el proyecto!"
                );
                setRegisteredProjectId(projectId); // Actualiza el proyecto registrado después de la inscripción
            })
            .catch((error) => {
                console.error("Error al registrarse en el proyecto:", error);
                setSuccessMessage("Error al registrarse en el proyecto.");
            });
    };

    const handleProjectClick = (projectId) => {
        if (projectId === registeredProjectId) {
            navigate(`/proyectos/${projectId}/grupos-estudiante`);
        } else {
            setErrorMessage(
                "Solo puedes acceder al proyecto en el que estás registrado."
            );
            setShowErrorModal(true);
        }
    };

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="proyecto-estudiante">
            <Header />

            <div className="container">
                <h2 className="title">Proyectos</h2>
                <div className="project-list">
                    <div className="project-list">
                        <div className="project-list">
                            {projects.map((project) => (
                                <div
                                    key={project.ID_PROYECTO}
                                    className="project-item"
                                >
                                    <div className="project-image">
                                        <img
                                            src={`http://localhost:8000/storage/${project.PORTADA_PROYECTO}`}
                                            alt={project.NOMBRE_PROYECTO}
                                        />
                                    </div>
                                    <div className="project-content">
                                        <div className="project-info">
                                            <h3
                                                onClick={() =>
                                                    handleProjectClick(
                                                        project.ID_PROYECTO
                                                    )
                                                }
                                            >
                                                {project.NOMBRE_PROYECTO}
                                            </h3>
                                            <p>{project.DESCRIP_PROYECTO}</p>
                                            {project.docente && (
                                                <p className="docente-info">
                                                    Docente:{" "}
                                                    {
                                                        project.docente
                                                            .NOMBRE_DOCENTE
                                                    }{" "}
                                                    {
                                                        project.docente
                                                            .APELLIDO_DOCENTE
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {/* Condición para mostrar "Registrado" o el botón "Registrar" */}
                                        {isRL &&
                                            (registeredProjectId ===
                                            project.ID_PROYECTO ? (
                                                <p className="registered-text">
                                                    Registrado
                                                </p>
                                            ) : (
                                                registeredProjectId ===
                                                    null && ( // Solo muestra "Registrar" si no está registrado en ningún proyecto
                                                    <button
                                                        className="registered-button"
                                                        onClick={() =>
                                                            handleRegister(
                                                                project.ID_PROYECTO
                                                            )
                                                        }
                                                    >
                                                        Registrarse
                                                    </button>
                                                )
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {successMessage && (
                    <div className="success-messages">{successMessage}</div>
                )}
            </div>

            {/* Modal de error */}
            {showErrorModal && (
                <ModalError
                    title="Error de acceso"
                    errorMessage={errorMessage}
                    closeModal={() => setShowErrorModal(false)}
                />
            )}
        </div>
    );
};

export default ProyectoEstudiante;
