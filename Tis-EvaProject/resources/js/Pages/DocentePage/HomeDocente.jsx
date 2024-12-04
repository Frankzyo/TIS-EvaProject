import React, { useEffect, useState } from "react";
import HeaderDocente from "../Components/HeaderDocente";
import SidebarDocente from "../Components/SidebarDocente";
import "../../css/SidebarDocente.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import EquiposDocente from "../../Components/EquiposDocente";
import PlanillaSeguimiento from "../../Components/PlanillaSeguimiento";
import "../../css/HomeDocente.css";
import SidebarPrueba from "../Components/SidebarPrueba";
import HeaderProyecto from "../Components/HeaderProyecto";
import Grupos from "../GruposPage/Grupos";
import TposEvaluaciones from "./TposEvaluaciones";
import CrearEvaluacion from "./CrearEvaluacion";
import Rubrica from "./Rubrica";
const HomeDocente = () => {
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);
    const [projectData, setProjectData] = useState(null); // Estado para almacenar los datos del proyecto
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { idProyecto } = useParams();
    const [vistaActiva, setVistaActiva] = useState("Equipos");
    const isModalOpen = false;
    const manejarCambioDeVista = (vista) => {
        setVistaActiva(vista);
    };
    useEffect(() => {
        const docenteId = localStorage.getItem("ID_DOCENTE");
        const role = localStorage.getItem("ROLE");

        if (!docenteId || role !== "Docente") {
            // Si no hay un docente logueado, redirige al login
            navigate("/login");
        }
    }, [navigate]);
    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api-docente/proyecto/${idProyecto}`
                );
                setProjectData(response.data);
            } catch (error) {
                console.error(
                    "Error al obtener los datos del proyecto:",
                    error
                );
            } finally {
                setLoading(false); // Cambia el estado de carga a false
            }
        };

        fetchProjectData();
    }, [idProyecto]);

    return (
        <>
            <div className="home-docente">
                <HeaderProyecto isModalOpen={isModalOpen} />
                <div className="container-sid">
                    <SidebarPrueba
                        isSidebarCollapsed={isSidebarCollapsed}
                        toggleSidebar={toggleSidebar}
                        nombreProyecto={projectData?.NOMBRE_PROYECTO}
                        fotoProyecto={projectData?.PORTADA_PROYECTO}
                        projectId={idProyecto}
                        cambiarVista={manejarCambioDeVista}
                    />
                    <div className="content">
                        {vistaActiva === "Equipos" && (
                            <Grupos projectId={idProyecto} />
                        )}
                        {vistaActiva === "PlanillaSeguimiento" && (
                            <PlanillaSeguimiento />
                        )}
                        {vistaActiva === "TipoEvaluaciones" && (
                            <TposEvaluaciones
                                cambiarVista={manejarCambioDeVista}
                            />
                        )}
                        {vistaActiva === "CrearEvaluacion" && (
                            <CrearEvaluacion
                                cambiarVista={manejarCambioDeVista}
                            />
                        )}
                        {vistaActiva === "CrearRubrica" && (
                            <Rubrica cambiarVista={manejarCambioDeVista} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
export default HomeDocente;
