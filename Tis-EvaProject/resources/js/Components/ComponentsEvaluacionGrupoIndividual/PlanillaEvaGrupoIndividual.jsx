import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../../css/EstilosEvaluacionGrupoIndividual/PlanillaEvaGrupoIndividual.css"; // Estilos para el componente

const PlanillaEvaGrupoIndividual = ({ grupoId, etapaId }) => {
    const [planillaNotas, setPlanillaNotas] = useState([]);
    const [grupoDetails, setGrupoDetails] = useState({});
    const [fechaDefensa, setFechaDefensa] = useState("");

    useEffect(() => {
        const fetchPlanilla = async () => {
            try {
                // Obtener los detalles del grupo
                const grupoResponse = await axios.get(
                    `http://localhost:8000/api/grupo/${grupoId}`,
                    { withCredentials: true }
                );
                setGrupoDetails(grupoResponse.data);

                // Obtener fecha de defensa
                const defensaResponse = await axios.get(
                    `http://localhost:8000/api/defensa/grupo/${grupoId}`,
                    { withCredentials: true }
                );
                setFechaDefensa(defensaResponse.data.FECHA_DEFENSA); // Supongamos que la respuesta tiene una propiedad llamada FECHA_DEFENSA

                // Obtener las evaluaciones de los estudiantes para la etapa
                const evaluacionesResponse = await axios.get(
                    `http://localhost:8000/api/evaluaciones-individuales/${grupoId}/${etapaId}`,
                    { withCredentials: true }
                );
                setPlanillaNotas(evaluacionesResponse.data); // Asumimos que la respuesta tiene la estructura adecuada
            } catch (error) {
                console.error(
                    "Error al cargar la planilla de evaluación:",
                    error
                );
            }
        };

        if (grupoId && etapaId) {
            fetchPlanilla();
        }
    }, [grupoId, etapaId]);

    return (
        <div className="planilla-eva-grupo-container">
            <h3>Grupo: {grupoDetails.NOMBRE_GRUPO}</h3>
            <h4>Fecha de Defensa: {fechaDefensa}</h4>
            <table className="planilla-eva-grupo-table">
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>
                            19 de noviembre de 2024 (Lunes de 07:30 a 08:15)
                        </th>
                        <th>
                            20 de noviembre de 2024 (Lunes de 07:30 a 08:15)
                        </th>
                        <th>Retraso (R)</th>
                        <th>Falta (F)</th>
                    </tr>
                </thead>
                <tbody>
                    {planillaNotas.length > 0 ? (
                        planillaNotas.map((nota, index) => (
                            <tr key={index}>
                                <td>{`${nota.NOMBRE_EST} ${nota.APELLIDO_EST}`}</td>
                                <td>
                                    {nota.PUNTUACION_TOTAL &&
                                    nota.FECHA_REVISION === "2024-11-19"
                                        ? nota.PUNTUACION_TOTAL
                                        : "No disponible"}
                                </td>
                                <td>
                                    {nota.PUNTUACION_TOTAL &&
                                    nota.FECHA_REVISION === "2024-11-20"
                                        ? nota.PUNTUACION_TOTAL
                                        : "No disponible"}
                                </td>
                                <td>{nota.RETRASO ? "Sí" : "No"}</td>
                                <td>{nota.FALTA ? "Sí" : "No"}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">
                                No hay datos de evaluación disponibles.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PlanillaEvaGrupoIndividual;
