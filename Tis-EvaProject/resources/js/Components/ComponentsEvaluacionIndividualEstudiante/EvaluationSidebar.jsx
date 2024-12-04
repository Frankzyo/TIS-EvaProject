import React from "react";
import SidebarPrueba from "../../Components/ComponenteSidebar/SidebarPrueba";
import "../../../css/EstilosEvaluaciones/EvaluacionIndividualEstudiante.css";

const EvaluationSidebar = ({
    isSidebarCollapsed,
    toggleSidebar,
    projectDetails,
    projectId,
}) => (
    <SidebarPrueba
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
        fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
        projectId={projectId}
    />
);

export default EvaluationSidebar;
