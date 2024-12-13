import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import SidebarPrueba from "../../Components/ComponenteSidebar/SidebarPrueba";
import Reportes from "../../Components/ComponenteReporte/Reportes";
import "../../../css/EstilosHeader/HeaderProyecto.css";
import "../../../css/EstilosSidebar/SidebarPrueba.css";
import "../../../css/EstilosDocente/PlanillaDeSeguimiento.css";
import axios from "axios";

const ReportesPage = () => {
    const { projectId } = useParams();
    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [projectData, setProjectData] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [studentsData, setStudentsData] = useState([]);
    const [autoevalResults, setAutoevalResults] = useState([]);
    const [cruzadasResults, setCruzadasResults] = useState([]);
    const [paresResults, setParesResults] = useState([]);

    // Fetch project details and groups
    useEffect(() => {
        if (projectId) {
            const fetchProjectDetails = async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:8000/api/proyectos/${projectId}`,
                        { withCredentials: true }
                    );
                    setProjectDetails(response.data);
                } catch (error) {
                    console.error("Error al cargar el proyecto:", error);
                }
            };

            const fetchProjectData = async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:8000/api/proyectos/${projectId}/grupos`,
                        { withCredentials: true }
                    );
                    setProjectData(response.data.groups || []);
                } catch (error) {
                    console.error(
                        "Error al obtener los datos del proyecto:",
                        error
                    );
                }
            };

            fetchProjectDetails();
            fetchProjectData();
        }
    }, [projectId]);

    // Fetch group-specific data
    useEffect(() => {
        if (selectedGroup) {
            const fetchGroupData = async () => {
                try {
                    const [
                        notasResponse,
                        cruzadasResponse,
                        autoevaluacionesResponse,
                        paresResponse,
                    ] = await Promise.all([
                        axios.get(
                            `http://localhost:8000/api/grupos/${selectedGroup}/notas`,
                            {
                                withCredentials: true,
                            }
                        ),
                        axios.get(
                            `http://localhost:8000/api/evaluaciones-cruzadas/grupos/${selectedGroup}/notas`,
                            {
                                withCredentials: true,
                            }
                        ),
                        axios.get(
                            `http://localhost:8000/api/autoevaluaciones/grupos/${selectedGroup}/notas`,
                            {
                                withCredentials: true,
                            }
                        ),
                        axios.get(
                            `http://localhost:8000/api/grupos/${selectedGroup}/proyecto/${projectId}/promedio-notas`,
                            {
                                withCredentials: true,
                            }
                        ),
                    ]);

                    setStudentsData(notasResponse.data || []);
                    setCruzadasResults(cruzadasResponse.data || []);
                    setAutoevalResults(autoevaluacionesResponse.data || []);
                    setParesResults(paresResponse.data || []);
                } catch (error) {
                    console.error("Error al obtener datos del grupo:", error);
                }
            };

            fetchGroupData();
        }
    }, [selectedGroup, projectId]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const handleGroupSelection = (event) => {
        setSelectedGroup(event.target.value);
    };

    return (
        <div
            className={`planilla-seguimiento-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderProyecto />
            <div className="planilla-seguimiento-sidebar-content">
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                />
                <div className="container">
                    <div className="projects-header">
                        <h2>Reportes</h2>
                    </div>

                    <div className="dropdown-container">
                        <label htmlFor="groupDropdown">
                            Selecciona un grupo:
                        </label>
                        <select
                            id="groupDropdown"
                            value={selectedGroup || ""}
                            onChange={handleGroupSelection}
                        >
                            <option value="" disabled>
                                Seleccionar grupo
                            </option>
                            {Array.isArray(projectData) &&
                            projectData.length > 0 ? (
                                projectData.map((group) => (
                                    <option
                                        key={group.ID_GRUPO}
                                        value={group.ID_GRUPO}
                                    >
                                        {group.NOMBRE_GRUPO}
                                    </option>
                                ))
                            ) : (
                                <option disabled>
                                    No hay grupos disponibles
                                </option>
                            )}
                        </select>
                    </div>

                    {selectedGroup ? (
                        <div className="reportes-section">
                            <Reportes
                                studentsData={studentsData}
                                autoevalResults={autoevalResults}
                                cruzadasResults={cruzadasResults}
                                paresResults={paresResults}
                            />
                        </div>
                    ) : projectData.length === 0 ? (
                        <p className="no-data-message">
                            No hay grupos disponibles para este proyecto.
                        </p>
                    ) : (
                        <p className="no-data-message">
                            Por favor, selecciona un grupo para ver los
                            reportes.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportesPage;
