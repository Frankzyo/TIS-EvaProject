import React from "react";
import "../../../css/EstilosEvaluaciones/EvaluacionIndividualEstudiante.css";

const RubricaDetails = ({
    rubricas = [],
    expandedRubricas = {},
    toggleExpandRubrica = () => {},
    setRubricas = () => {},
    etapaDetails = {},
    evaluationExists = true, // Indica si la evaluación existe
}) => {
    // Función para calcular la puntuación ajustada de un criterio
    const calcularPuntuacionAjustada = (criterio) => {
        const pesoEtapa = etapaDetails?.ETAPAS_PUNTUACION || 0;
        const pesoCriterio = criterio?.PESO_CRITERIO || 0;
        return ((pesoCriterio / 100) * pesoEtapa).toFixed(2);
    };

    const handlePuntuacionChange = (rubricaId, criterioId, value) => {
        setRubricas((prevRubricas) =>
            prevRubricas.map((rubrica) =>
                rubrica.ID_RUBRICA === rubricaId
                    ? {
                          ...rubrica,
                          criterios: rubrica.criterios.map((criterio) =>
                              criterio.ID_CRITERIO === criterioId
                                  ? {
                                        ...criterio,
                                        PUNTUACION_SIN_AJUSTAR: value,
                                    }
                                  : criterio
                          ),
                      }
                    : rubrica
            )
        );
    };

    if (!evaluationExists) {
        return (
            <div className="evaluacion-individual-list">
                <p>No se encontró evaluación registrada para esta etapa.</p>
            </div>
        );
    }

    return (
        <div className="evaluacion-individual-rubricas-container">
            <h3>
                Rúbricas de{" "}
                {rubricas.length > 0 ? etapaDetails.ETAPAS_TITULO : "la Etapa"}
            </h3>
            <div className="evaluacion-individual-list">
                {rubricas.length > 0 ? (
                    rubricas.map((rubrica) => (
                        <div
                            key={rubrica.ID_RUBRICA}
                            className="rubrica-section organized-column"
                        >
                            {/* Encabezado de la rúbrica */}
                            <div className="rubrica-header">
                                <h4>
                                    {rubrica.NOMBRE_RUBRICA || "Sin nombre"}
                                </h4>
                                <div className="rubrica-header-info">
                                    <span className="peso-total">
                                        Peso Total:{" "}
                                        {rubrica.PESO_RUBRICA?.toFixed(2) ||
                                            "0.00"}
                                    </span>
                                    <button
                                        className="expand-btn"
                                        onClick={() =>
                                            toggleExpandRubrica(
                                                rubrica.ID_RUBRICA
                                            )
                                        }
                                    >
                                        <i
                                            className={`fas ${
                                                expandedRubricas[
                                                    rubrica.ID_RUBRICA
                                                ]
                                                    ? "fa-chevron-up"
                                                    : "fa-chevron-down"
                                            }`}
                                        ></i>
                                    </button>
                                </div>
                            </div>

                            {/* Detalles de la rúbrica */}
                            {expandedRubricas[rubrica.ID_RUBRICA] && (
                                <div className="rubrica-details-specific">
                                    <div className="criterios-container-specific">
                                        {rubrica.criterios?.length > 0 ? (
                                            rubrica.criterios.map(
                                                (criterio) => (
                                                    <div
                                                        key={
                                                            criterio.ID_CRITERIO
                                                        }
                                                        className="criterio-section-specific"
                                                    >
                                                        {/* Encabezado del criterio */}
                                                        <div className="criterio-header-specific">
                                                            <h5 className="criterio-title-specific">
                                                                {criterio.NOMBRE_CRITERIO ||
                                                                    "Sin título"}
                                                            </h5>
                                                            <span className="criterio-peso-specific">
                                                                Peso:{" "}
                                                                {criterio.PESO_CRITERIO?.toFixed(
                                                                    2
                                                                ) || "0.00"}
                                                            </span>
                                                        </div>

                                                        {/* Descripción del criterio */}
                                                        <p className="criterio-description-specific">
                                                            {
                                                                criterio.DESCRIPCION_CRITERIO
                                                            }
                                                        </p>

                                                        {/* Contenedor de calificación */}
                                                        <div className="criterio-calificacion-container-specific">
                                                            <select
                                                                id={`calificacion-sin-ajustar-${criterio.ID_CRITERIO}`}
                                                                className="criterio-calificacion-dropdown-specific"
                                                                value={
                                                                    criterio.PUNTUACION_SIN_AJUSTAR ??
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handlePuntuacionChange(
                                                                        rubrica.ID_RUBRICA,
                                                                        criterio.ID_CRITERIO,
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ) || 0
                                                                    )
                                                                }
                                                            >
                                                                <option value="">
                                                                    Seleccione
                                                                    una opción
                                                                </option>
                                                                {criterio.niveles?.map(
                                                                    (nivel) => (
                                                                        <option
                                                                            key={
                                                                                nivel.ID_NIVEL
                                                                            }
                                                                            value={
                                                                                nivel.PUNTOS
                                                                            }
                                                                        >
                                                                            {
                                                                                nivel.TITULO_NIVEL
                                                                            }{" "}
                                                                            :{" "}
                                                                            {
                                                                                nivel.PUNTOS
                                                                            }{" "}
                                                                            puntos
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <p>
                                                No se encontraron criterios para
                                                esta rúbrica.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No se encontraron rúbricas para esta etapa.</p>
                )}
            </div>
        </div>
    );
};

export default RubricaDetails;
