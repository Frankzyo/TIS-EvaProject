import React from "react";
import "../../../css/EstilosEvaluaciones/EvaluacionIndividualEstudiante.css";

const SaveEvaluationButton = ({ handleSaveEvaluation }) => (
    <div className="evaluacion-individual-save-button">
        <button onClick={handleSaveEvaluation} className="save-evaluation-btn">
            Guardar Evaluación
        </button>
    </div>
);

export default SaveEvaluationButton;
