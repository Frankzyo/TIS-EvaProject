import React, { useEffect } from "react";
import "../../../css/EstilosEvaluaciones/EvaluacionIndividualEstudiante.css";

// Función para obtener la fecha actual ajustada a la zona horaria de Bolivia (UTC-4)
const getLocalDateForBolivia = () => {
    const today = new Date();
    // Usar Intl.DateTimeFormat para ajustar la zona horaria
    return new Intl.DateTimeFormat("es-BO", {
        timeZone: "America/La_Paz",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
        .format(today)
        .split("/")
        .reverse()
        .join("-"); // Convierte "dd/mm/yyyy" a "yyyy-mm-dd"
};

const StudentSummary = ({
    estudianteDetails,
    groupInfo,
    defenseDate,
    revisionDate,
    setRevisionDate,
}) => {
    // Usar useEffect para establecer la fecha actual si no hay fecha de revisión
    useEffect(() => {
        if (!revisionDate) {
            const today = getLocalDateForBolivia(); // Obtener la fecha actual ajustada a Bolivia
            setRevisionDate(today); // Establecer como fecha de revisión inicial
        }
    }, [revisionDate, setRevisionDate]);

    return (
        <div className="header-summary">
            <div className="student-info-container">
                <img
                    src={`http://localhost:8000/storage/${
                        estudianteDetails?.FOTO_EST ||
                        "profile_photos/placeholder.jpg"
                    }`}
                    alt={`Foto de ${estudianteDetails?.NOMBRE_EST}`}
                    className="student-photo"
                />
                <div className="student-info">
                    <h2>
                        {estudianteDetails?.NOMBRE_EST}{" "}
                        {estudianteDetails?.APELLIDO_EST}
                    </h2>
                    <p>
                        <strong>Rol:</strong> {estudianteDetails?.ROL_EST}
                    </p>
                    <p>
                        <strong>Grupo:</strong>{" "}
                        {groupInfo?.NOMBRE_GRUPO || "No asignado"}
                    </p>
                    <p>
                        <strong>Fecha de Defensa:</strong>{" "}
                        {defenseDate
                            ? `${defenseDate.day} de ${defenseDate.HR_INIDEF} a ${defenseDate.HR_FINDEF}`
                            : "No asignada"}
                    </p>
                </div>
            </div>
            <div className="revision-info-container">
                <div className="revision-date">
                    <h4>Fecha de Revisión</h4>
                    <input
                        type="date"
                        value={revisionDate || ""}
                        onChange={(e) => setRevisionDate(e.target.value)}
                        className="date-picker"
                    />
                </div>
            </div>
        </div>
    );
};

export default StudentSummary;
