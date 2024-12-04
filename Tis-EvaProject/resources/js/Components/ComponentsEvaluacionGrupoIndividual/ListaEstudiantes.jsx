import React, { useEffect, useState } from "react";
import axios from "axios";

const ListaEstudiantes = ({ estudiantes, onEvaluarEstudiante, etapaId, idGrupo }) => {
    const [estadoEstudiantes, setEstadoEstudiantes] = useState([]);

    useEffect(() => {
        if (!idGrupo || !etapaId) return; // Asegúrate de que idGrupo esté disponible

        const fetchEstadoEstudiantes = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/evaluaciones-individuales/${idGrupo}/${etapaId}/falta-retraso`,
                    { withCredentials: true }
                );

                const estados = estudiantes.map((estudiante) => {
                    const evaluacion = response.data.data.find(
                        (e) => e.ID_ESTUDIANTE === estudiante.ID_EST
                    );
                    return {
                        ...estudiante,
                        FALTA: evaluacion?.FALTA || false,
                        RETRASO: evaluacion?.RETRASO || false,
                    };
                });

                setEstadoEstudiantes(estados);
            } catch (error) {
                console.error("Error al cargar estado de estudiantes:", error);
            }
        };

        fetchEstadoEstudiantes();
    }, [estudiantes, idGrupo, etapaId]);

    // Manejar cambios en los checkboxes de Falta y Retraso
    const handleCheckboxChange = async (estudianteId, field, value) => {
        try {
            await axios.put(
                `http://localhost:8000/api/evaluaciones-individuales/${estudianteId}/${etapaId}/falta-retraso`,
                {
                    FALTA:
                        field === "FALTA"
                            ? value
                            : estadoEstudiantes.find(
                                  (est) => est.ID_EST === estudianteId
                              ).FALTA,
                    RETRASO:
                        field === "RETRASO"
                            ? value
                            : estadoEstudiantes.find(
                                  (est) => est.ID_EST === estudianteId
                              ).RETRASO,
                },
                { withCredentials: true }
            );

            setEstadoEstudiantes((prevEstado) =>
                prevEstado.map((est) =>
                    est.ID_EST === estudianteId
                        ? { ...est, [field]: value }
                        : est
                )
            );
        } catch (error) {
            console.error(
                "Error al actualizar Falta/Retraso:",
                error.response?.data || error.message
            );
        }
    };

    return (
        <div className="estudiantes-grupo-container">
            <h3>Estudiantes del Grupo</h3>
            {estadoEstudiantes.length > 0 ? (
                estadoEstudiantes.map((estudiante, index) => {
                    const fotoUrl = `http://localhost:8000/storage/${
                        estudiante.FOTO_EST || "profile_photos/placeholder.jpg"
                    }`;

                    return (
                        <div key={index} className="estudiante-item">
                            <div className="estudiante-info">
                                <img
                                    src={fotoUrl}
                                    alt={`Foto de ${estudiante.NOMBRE_EST}`}
                                    className="estudiante-foto"
                                />
                                <div className="estudiante-texto">
                                    <p className="estudiante-nombre">
                                        {estudiante.NOMBRE_EST}{" "}
                                        {estudiante.APELLIDO_EST}
                                    </p>
                                    <p className="estudiante-rol">
                                        {estudiante.ROL_EST}
                                    </p>
                                </div>
                            </div>
                            <div className="estudiante-controles">
                                <button
                                    className="evaluar-btn"
                                    onClick={() =>
                                        onEvaluarEstudiante(estudiante.ID_EST)
                                    }
                                >
                                    Evaluar
                                </button>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={
                                            estadoEstudiantes.find(
                                                (est) =>
                                                    est.ID_EST ===
                                                    estudiante.ID_EST
                                            )?.RETRASO || false
                                        }
                                        onChange={(e) =>
                                            handleCheckboxChange(
                                                estudiante.ID_EST,
                                                "RETRASO",
                                                e.target.checked
                                            )
                                        }
                                    />
                                    Retraso
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={
                                            estadoEstudiantes.find(
                                                (est) =>
                                                    est.ID_EST ===
                                                    estudiante.ID_EST
                                            )?.FALTA || false
                                        }
                                        onChange={(e) =>
                                            handleCheckboxChange(
                                                estudiante.ID_EST,
                                                "FALTA",
                                                e.target.checked
                                            )
                                        }
                                    />
                                    Falta
                                </label>
                            </div>
                        </div>
                    );
                })
            ) : (
                <p>No hay estudiantes en este grupo.</p>
            )}
        </div>
    );
};

export default ListaEstudiantes;
