import { divide } from "lodash";
import React, { useEffect, useState } from "react";
import HeaderEstudiante from "../../Components/ComponenteHeader/HeaderEstudiante";
import SidebarEstudiante from "../../Components/ComponenteSidebar/SidebarEstudiante";
import Backlog from "./Backlog";
import "../../../css/EstilosEstudiante/HomeEstudiante.css";
import { useNavigate } from "react-router-dom";

const HomeEstudiante = () => {
    const [vistaActiva, setVistaActiva] = useState("Backlog");
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);
    const [proyecto, setProyecto] = useState(null);
    const [grupo, setGrupo] = useState(null);
    const [isRepresentanteLegal, setIsRepresentanteLegal] = useState(false);
    const navigate = useNavigate();
    const manejarCambioDeVista = (vista) => {
        setVistaActiva(vista);
    };
    useEffect(() => {
        const role = localStorage.getItem("ROLE");
        const estudianteId = localStorage.getItem("ID_EST");
        const representanteLegal = localStorage.getItem("IS_RL");

        // Verificar si el usuario tiene el rol de "Estudiante" y un ID de estudiante
        if (role !== "Estudiante" || !estudianteId) {
            navigate("/login"); // Redirige al login si no cumple las condiciones
        } else {
            // Solo establece el estado de Representante Legal si es un estudiante autenticado
            setIsRepresentanteLegal(representanteLegal === "true");
        }
    }, [navigate]);
    useEffect(() => {
        const obtenerDatosEstudiante = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/estudiante/proyecto-grupo",
                    { withCredentials: true }
                );

                if (response.data) {
                    setProyecto(response.data.proyecto);
                    setGrupo(response.data.grupo);
                }
            } catch (error) {
                console.error(
                    "Error al cargar los datos del estudiante:",
                    error
                );
                setErrorMessage(
                    "No has registrado tu participación en un proyecto ni creado tu grupo. Completa este registro para continuar con la planificación de tus tareas."
                );
                setIsErrorModalOpen(true); // Muestra el modal si hay error
            }
        };
    }, []);
    return (
        <>
            <div className="container-home-estudiante">
                <HeaderEstudiante />
                <div className="contaner-sidebar">
                    <SidebarEstudiante
                        isSidebarCollapsed={isSidebarCollapsed}
                        toggleSidebar={toggleSidebar}
                        nombreProyecto={proyecto?.NOMBRE_PROYECTO} // Campo del nombre del proyecto
                        fotoProyecto={`http://localhost:8000/storage/${proyecto?.PORTADA_PROYECTO}`} // Ruta completa de la imagen
                        projectId={proyecto?.ID_PROYECTO}
                        groupId={grupo?.ID_GRUPO}
                        isRepresentanteLegal={isRepresentanteLegal}
                    />
                    <div className="contaner-content">
                        {vistaActiva === "Backlog" && <Backlog />}
                    </div>
                </div>
            </div>
        </>
    );
};
export default HomeEstudiante;
