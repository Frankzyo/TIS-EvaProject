import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEstudiante from "../../Components/ComponenteSidebar/SidebarEstudiante";
import HeaderEstudiante from "../../Components/ComponenteHeader/HeaderEstudiante";
import useProjectAndGroupId from "../../Components/useProjectAndGroupId";
import axios from "axios";
import "../../../css/EstilosSidebar/SidebarEstudiante.css";
import "../../../css/EstilosGrupo/EquipoEstudiante.css";

const rolesScrum = ["Product Owner", "Scrum Master", "Development Team"]; // Definimos los roles

const EquipoEstudiante = () => {
    const navigate = useNavigate();
    const [proyecto, setProyecto] = useState(null);
    const [grupo, setGrupo] = useState(null);
    const { projectId, groupId } = useProjectAndGroupId();
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [estudiantes, setEstudiantes] = useState([]);
    const [isRepresentanteLegal, setIsRepresentanteLegal] = useState(false);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    useEffect(() => {
        const role = localStorage.getItem("ROLE");
        const estudianteId = localStorage.getItem("ID_EST");
        const representanteLegal = localStorage.getItem("IS_RL");

        if (role !== "Estudiante" || !estudianteId) {
            navigate("/login");
        }

        setIsRepresentanteLegal(representanteLegal === "true");
    }, [navigate]);

    useEffect(() => {
        const obtenerDatosEstudiante = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/estudiante/proyecto-grupo",
                    { withCredentials: true }
                );
                console.log("Datos del estudiante:", response.data);

                if (response.data) {
                    setProyecto(response.data.proyecto);
                    setGrupo(response.data.grupo);
                    obtenerEstudiantesDelGrupo(response.data.grupo.ID_GRUPO);
                }
            } catch (error) {
                console.error(
                    "Error al cargar los datos del estudiante:",
                    error
                );
            }
        };

        obtenerDatosEstudiante();
    }, []);

    const obtenerEstudiantesDelGrupo = async (groupId) => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/estudiantes/grupo/${groupId}`
            );
            console.log("Estudiantes del grupo:", response.data);
            setEstudiantes(response.data);
        } catch (error) {
            console.error("Error al obtener estudiantes del grupo:", error);
        }
    };

    const handleRoleChange = async (estudianteId, newRole) => {
        try {
            await axios.put(
                `http://localhost:8000/api/estudiantes/${estudianteId}/rol`,
                {
                    ROL_EST: newRole,
                }
            );
            setEstudiantes((prevEstudiantes) =>
                prevEstudiantes.map((estudiante) =>
                    estudiante.ID_EST === estudianteId
                        ? { ...estudiante, ROL_EST: newRole }
                        : estudiante
                )
            );
            console.log(
                `Rol actualizado para el estudiante con ID ${estudianteId}: ${newRole}`
            );
        } catch (error) {
            console.error("Error al actualizar el rol del estudiante:", error);
        }
    };

    return (
        <div className="equipo-estudiante-container">
            <HeaderEstudiante />
            <div className="equipo-estudiante-sidebar-wrapper">
                <div className="equipo-estudiante-sidebar-content">
                    <SidebarEstudiante
                        isSidebarCollapsed={isSidebarCollapsed}
                        toggleSidebar={toggleSidebar}
                        nombreProyecto={proyecto?.NOMBRE_PROYECTO}
                        fotoProyecto={`http://localhost:8000/storage/${proyecto?.PORTADA_PROYECTO}`}
                        isRepresentanteLegal={isRepresentanteLegal}
                        projectId={projectId}
                        groupId={groupId}
                    />
                    <div className="equipo-estudiante-main-content">
                        {grupo && (
                            <div className="planificacion-group-info">
                                <img
                                    src={
                                        grupo.PORTADA_GRUPO
                                            ? `http://localhost:8000/storage/${grupo.PORTADA_GRUPO}`
                                            : "https://via.placeholder.com/150"
                                    }
                                    alt="Icono del grupo"
                                    className="planificacion-group-image"
                                />
                                <div className="planificacion-group-info-text">
                                    <h2 className="planificacion-group-title">
                                        {grupo.NOMBRE_GRUPO}
                                    </h2>
                                    <p className="planificacion-group-description">
                                        {grupo.DESCRIP_GRUPO ||
                                            "Descripción no disponible"}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="planificacion-divisor-container">
                            <div className="planificacion-divisor-est"></div>
                        </div>
                        <div className="contenedor-titulo-planificacion">
                            <h1 className="titulo-planificacion">Equipo</h1>
                            <hr className="divisor-planificacion" />
                        </div>

                        {/* Lista de estudiantes del grupo con scroll independiente */}
                        <div className="equipo-estudiantes-list">
                            {estudiantes.map((estudiante) => (
                                <div
                                    key={estudiante.ID_EST}
                                    className="equipo-estudiante-card"
                                >
                                    <img
                                        src={`http://localhost:8000/storage/${estudiante.FOTO_EST}`}
                                        alt="Foto del estudiante"
                                        className="equipo-estudiante-profile-image"
                                    />
                                    <div className="equipo-estudiante-info">
                                        <div className="equipo-estudiante-info-item">
                                            <span className="equipo-estudiante-label">
                                                Nombre:
                                            </span>
                                            <span className="equipo-estudiante-value">
                                                {estudiante.NOMBRE_EST}{" "}
                                                {estudiante.APELLIDO_EST}
                                            </span>
                                        </div>
                                        <div className="equipo-estudiante-info-item">
                                            <span className="equipo-estudiante-label">
                                                Email:
                                            </span>
                                            <span className="equipo-estudiante-value">
                                                {estudiante.EMAIL_EST}
                                            </span>
                                        </div>
                                        <div className="equipo-estudiante-info-item">
                                            <span className="equipo-estudiante-label">
                                                Representante Legal:
                                            </span>
                                            <span className="equipo-estudiante-value">
                                                {estudiante.IS_RL ? "Sí" : "No"}
                                            </span>
                                        </div>
                                        <div className="equipo-estudiante-info-item">
                                            <span className="equipo-estudiante-label">
                                                Rol:
                                            </span>
                                            <select
                                                className="equipo-estudiante-value"
                                                value={estudiante.ROL_EST || ""}
                                                onChange={(e) =>
                                                    handleRoleChange(
                                                        estudiante.ID_EST,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Seleccione un rol
                                                </option>
                                                {rolesScrum.map((rol) => (
                                                    <option
                                                        key={rol}
                                                        value={rol}
                                                    >
                                                        {rol}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipoEstudiante;
