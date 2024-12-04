import React from "react";
import "../../../css/EstilosEvaluaciones/EvaluacionIndividualEstudiante.css";

const EvaluationHeader = ({ estudianteDetails }) => (
    <div className="evaluacion-grupo-individual-header">
        <h2>
            Evaluación Individual{" "}
            {estudianteDetails?.NOMBRE_EST &&
                `de ${estudianteDetails.NOMBRE_EST} ${estudianteDetails.APELLIDO_EST}`}
        </h2>
    </div>
);

export default EvaluationHeader;
