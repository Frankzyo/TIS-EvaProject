import React from "react";
import "../../../css/EstilosEvaluaciones/EvaluacionIndividualEstudiante.css";

const EtapaSummary = ({ etapaDetails }) => (
    <div className="etapa-total-container">
        <p>
            <strong>Etapa:</strong>{" "}
            {etapaDetails?.ETAPAS_TITULO || "No asignado"}
        </p>
        <p>
            <strong>Puntuación Total de la Etapa:</strong>{" "}
            {etapaDetails?.ETAPAS_PUNTUACION || "No asignado"}
        </p>
    </div>
);

export default EtapaSummary;
