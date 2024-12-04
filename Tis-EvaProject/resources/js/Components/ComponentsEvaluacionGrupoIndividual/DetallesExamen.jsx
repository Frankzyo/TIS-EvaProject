import React from "react";

const DetallesExamen = ({ examenDetails }) => {
    if (!examenDetails) return <p>Cargando detalles de la evaluación...</p>;

    return (
        <div className="evaluacion-grupo-individual-details">
            <div className="grupo-foto-container">
                {examenDetails.PORTADA_GRUPO ? (
                    <img
                        src={examenDetails.PORTADA_GRUPO}
                        alt={`Foto de ${examenDetails.grupoNombre}`}
                        className="grupo-fotos"
                    />
                ) : (
                    <img
                        src="https://via.placeholder.com/50"
                        alt="Foto de grupo no disponible"
                        className="grupo-fotos"
                    />
                )}
            </div>
            <div className="evaluacion-grupo-individual-details-content">
                <h3>Grupo: {examenDetails.grupoNombre}</h3>
                <p>
                    <strong>Etapa:</strong> {examenDetails.etapaNombre}
                </p>
                <p>
                    <strong>Día de Defensa:</strong>{" "}
                    {examenDetails.defensaDia || "No asignado"}
                </p>
                <p>
                    <strong>Hora de Defensa:</strong>{" "}
                    {examenDetails.defensaHora || "No asignado"}
                </p>
                {examenDetails.representanteLegal && (
                    <div className="representante-info">
                        <h4>Representante Legal:</h4>
                        <p>
                            {examenDetails.representanteLegal.nombre}{" "}
                            {examenDetails.representanteLegal.apellido}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetallesExamen;
