import React, { useState, useEffect } from "react";
import "../../../css/EstilosEvaluaciones/EvaluacionIndividualEstudiante.css";

const NotaEtapaDirecta = ({
    initialNota = 0,
    maxNota = 100,
    setNotaEtapa,
    saveNotaEtapa,
}) => {
    const [nota, setNota] = useState(initialNota);

    // Sincroniza el estado local con los cambios en initialNota
    useEffect(() => {
        console.log("Recibiendo initialNota en NotaEtapaDirecta:", initialNota);
        setNota(initialNota); // Sincroniza el estado local con initialNota
    }, [initialNota]);

    const handleNotaChange = (e) => {
        const nuevaNota = parseFloat(e.target.value);
        if (isNaN(nuevaNota) || nuevaNota < 0 || nuevaNota > maxNota) {
            alert(`La nota debe estar entre 0 y ${maxNota}.`);
            return;
        }
        setNota(nuevaNota);
        setNotaEtapa(nuevaNota); // Notificar al componente padre
    };

    const handleBlur = () => {
        console.log("Guardando nota directa al salir del campo:", nota);
        saveNotaEtapa(nota); // Llamar la función para guardar la nota en el backend
    };

    return (
        <div className="evaluacion-individual-rubricas-container">
            <h3>Calificación Directa de la Etapa</h3>
            <div className="nota-etapa-input-container">
                <label htmlFor="nota-etapa-input">Puntuación Obtenida:</label>
                <input
                    id="nota-etapa-input"
                    type="number"
                    value={nota}
                    min="0"
                    max={maxNota}
                    step="0.01"
                    onChange={handleNotaChange}
                    onBlur={handleBlur} // Guardar al salir del campo
                    className="nota-etapa-input"
                />
                <span className="nota-etapa-max">/{maxNota}</span>
            </div>
        </div>
    );
};

export default NotaEtapaDirecta;
