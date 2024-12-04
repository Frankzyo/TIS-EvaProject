import React from "react";
import "../../../css/EstilosEvaluaciones/EvaluacionIndividualEstudiante.css";

const RubricasSummary = ({ rubricas, etapaDetails }) => {
    // Calcular totales de las puntuaciones directamente desde los datos del backend
    const totalSinAjustar = rubricas.reduce(
        (total, rubrica) =>
            total + parseFloat(rubrica.PUNTUACION_NO_AJUSTADA || 0),
        0
    );

    const totalAjustada = rubricas.reduce(
        (total, rubrica) =>
            total + parseFloat(rubrica.PUNTUACION_OBTENIDA || 0),
        0
    );

    const totalPesoRubricas = rubricas.reduce(
        (total, rubrica) => total + parseFloat(rubrica.PESO_RUBRICA || 0),
        0
    );

    return (
        <div className="evaluacion-individual-rubricas-container">
            <h3>Puntuaciones Obtenidas</h3>
            <ul className="puntuaciones-resumen-list">
                {rubricas.length > 0 ? (
                    <>
                        {rubricas.map((rubrica) => {
                            return (
                                <li
                                    key={rubrica.ID_RUBRICA}
                                    className="puntuaciones-resumen-item"
                                >
                                    <span className="rubrica-nombre">
                                        {rubrica.NOMBRE_RUBRICA}
                                    </span>
                                    <span className="rubrica-puntuacion">
                                        {" "}
                                        {Number.isFinite(
                                            parseFloat(
                                                rubrica.PUNTUACION_NO_AJUSTADA
                                            )
                                        )
                                            ? parseFloat(
                                                  rubrica.PUNTUACION_NO_AJUSTADA
                                              ).toFixed(2)
                                            : "0.00"}{" "}
                                        /{" "}
                                        {Number.isFinite(
                                            parseFloat(rubrica.PESO_RUBRICA)
                                        )
                                            ? parseFloat(
                                                  rubrica.PESO_RUBRICA
                                              ).toFixed(2)
                                            : "0.00"}
                                    </span>
                                    <span className="rubrica-puntuacion-ajustada">
                                        {" "}
                                        {Number.isFinite(
                                            parseFloat(
                                                rubrica.PUNTUACION_OBTENIDA
                                            )
                                        )
                                            ? parseFloat(
                                                  rubrica.PUNTUACION_OBTENIDA
                                              ).toFixed(2)
                                            : "0.00"}{" "}
                                        /{" "}
                                        {Number.isFinite(
                                            parseFloat(rubrica.PESO_RUBRICA)
                                        )
                                            ? (
                                                  (parseFloat(
                                                      rubrica.PESO_RUBRICA
                                                  ) /
                                                      100) *
                                                  (etapaDetails.ETAPAS_PUNTUACION ||
                                                      0)
                                              ).toFixed(2)
                                            : "0.00"}
                                    </span>
                                </li>
                            );
                        })}
                        <li className="puntuaciones-resumen-total">
                            <span className="rubrica-nombre-total">Total</span>
                            <span className="rubrica-puntuacion-total">
                                {" "}
                                {Number.isFinite(totalSinAjustar)
                                    ? totalSinAjustar.toFixed(2)
                                    : "0.00"}{" "}
                                /{" "}
                                {Number.isFinite(totalPesoRubricas)
                                    ? totalPesoRubricas.toFixed(2)
                                    : "0.00"}
                            </span>
                            <span className="rubrica-puntuacion-ajustada-total">
                                {" "}
                                {Number.isFinite(totalAjustada)
                                    ? totalAjustada.toFixed(2)
                                    : "0.00"}{" "}
                                /{" "}
                                {Number.isFinite(etapaDetails.ETAPAS_PUNTUACION)
                                    ? parseFloat(
                                          etapaDetails.ETAPAS_PUNTUACION
                                      ).toFixed(2)
                                    : "N/A"}
                            </span>
                        </li>
                    </>
                ) : (
                    <p>No se encontraron rúbricas para esta etapa.</p>
                )}
            </ul>
        </div>
    );
};

export default RubricasSummary;
