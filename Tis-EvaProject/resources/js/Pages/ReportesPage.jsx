import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderProyecto from "../Components/HeaderProyecto";
import SidebarPrueba from "../Components/SidebarPrueba";
import Reportes from "../Components/Reportes"; // Asegúrate de usar la ruta correcta
import "../../css/HeaderProyecto.css";
import "../../css/SidebarPrueba.css";
import "../../css/PlanillaDeSeguimiento.css";
import axios from "axios";

const ReportesPage = () => {
    const { projectId } = useParams();
    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [projectData, setProjectData] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [studentsData, setStudentsData] = useState([]);
    const [autoevalResults, setAutoevalResults] = useState([]);

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
        } else {
            console.error("No se pudo obtener el projectId");
        }
    }, [projectId]);

    useEffect(() => {
        if (selectedGroup) {
            const fetchAutoevalResults = async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:8000/autoevaluaciones/resultados?groupId=${selectedGroup}`,
                        { withCredentials: true }
                    );
                    setAutoevalResults(response.data || []);
                } catch (error) {
                    console.error(
                        "Error al obtener los resultados de autoevaluaciones:",
                        error
                    );
                }
            };
            fetchAutoevalResults();
        }
    }, [selectedGroup]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const handleGroupSelection = async (event) => {
        const groupId = event.target.value;
        setSelectedGroup(groupId);

        if (groupId) {
            try {
                const notasResponse = await axios.get(
                    `http://localhost:8000/api/grupos/${groupId}/notas`,
                    { withCredentials: true }
                );
                setStudentsData(notasResponse.data || []);
            } catch (error) {
                console.error(
                    "Error al obtener datos de los estudiantes o del grupo:",
                    error
                );
            }
        }
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
                        <label htmlFor="groupDropdown">Selecciona un grupo:</label>
                        <select
                            id="groupDropdown"
                            value={selectedGroup || ""}
                            onChange={handleGroupSelection}
                        >
                            <option value="" disabled>
                                Seleccionar grupo
                            </option>
                            {Array.isArray(projectData) && projectData.length > 0 ? (
                                projectData.map((group) => (
                                    <option
                                        key={group.ID_GRUPO}
                                        value={group.ID_GRUPO}
                                    >
                                        {group.NOMBRE_GRUPO}
                                    </option>
                                ))
                            ) : (
                                <option disabled>No hay grupos disponibles</option>
                            )}
                        </select>
                    </div>

                    {selectedGroup ? (
                        <div className="reportes-section">
                            <Reportes
                                studentsData={studentsData}
                                autoevalResults={autoevalResults}
                            />
                        </div>
                    ) : projectData.length === 0 ? (
                        <p className="no-data-message">
                            No hay grupos disponibles para este proyecto.
                        </p>
                    ) : (
                        <p className="no-data-message">
                            Por favor, selecciona un grupo para ver los reportes.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportesPage;
