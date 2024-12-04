import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderProyecto from "../Components/HeaderProyecto";
import SidebarPrueba from "../Components/SidebarPrueba";
import "../../css/HeaderProyecto.css";
import "../../css/SidebarPrueba.css";
import "../../css/EvaluacionIndividualEstudiante.css";
import axios from "axios";

const EvaluacionIndividualEstudiantee = () => {
    const { projectId, examenId, estudianteId, etapaId } = useParams();
    const [projectDetails, setProjectDetails] = useState({});
    const [etapaDetails, setEtapaDetails] = useState({});
    const [estudianteDetails, setEstudianteDetails] = useState({});
    const [rubricas, setRubricas] = useState([]);
    const [groupInfo, setGroupInfo] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedRubricas, setExpandedRubricas] = useState({});
    const [defenseDate, setDefenseDate] = useState(null);
    const [revisionDate, setRevisionDate] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch project details
                const projectResponse = await axios.get(
                    `http://localhost:8000/api/proyectos/${projectId}`,
                    { withCredentials: true }
                );
                setProjectDetails(projectResponse.data);

                // Fetch student details
                const estudianteResponse = await axios.get(
                    `http://localhost:8000/api/estudiantes/${estudianteId}`,
                    { withCredentials: true }
                );
                setEstudianteDetails(estudianteResponse.data);

                if (estudianteResponse.data.ID_GRUPO) {
                    // Fetch group info if the student is in a group
                    const groupResponse = await axios.get(
                        `http://localhost:8000/api/grupos/${estudianteResponse.data.ID_GRUPO}`,
                        { withCredentials: true }
                    );
                    setGroupInfo(groupResponse.data);
                }

                // Fetch etapa details
                const etapaResponse = await axios.get(
                    `http://localhost:8000/api/etapas/${etapaId}`,
                    { withCredentials: true }
                );
                setEtapaDetails(etapaResponse.data);

                // Fetch rubricas
                const rubricasResponse = await axios.get(
                    `http://localhost:8000/api/rubricas/${projectId}/${etapaId}`,
                    { withCredentials: true }
                );
                setRubricas(rubricasResponse.data);
                console.log("rubricas:", rubricasResponse.data);

                // Fetch defense date
                const defenseResponse = await axios.get(
                    `http://localhost:8000/api/defensa/grupo/${estudianteId}`,
                    { withCredentials: true }
                );
                setDefenseDate(defenseResponse.data);

                // Fetch evaluation data
                const evaluationResponse = await axios.get(
                    `http://localhost:8000/api/evaluaciones/${estudianteId}/${etapaId}`,
                    { withCredentials: true }
                );
                console.log("Evaluación del backend:", evaluationResponse.data); // Agregar log aquí

                if (evaluationResponse.data) {
                    const mappedRubricas =
                        evaluationResponse.data.notas_rubricas.map(
                            (rubrica) => ({
                                ID_RUBRICA: rubrica.ID_RUBRICA,
                                NOMBRE_RUBRICA:
                                    rubrica.NOMBRE_RUBRICA || "Sin Nombre",
                                PUNTUACION_OBTENIDA:
                                    parseFloat(rubrica.PUNTUACION_OBTENIDA) ||
                                    0,
                                PUNTUACION_SIN_AJUSTAR:
                                    parseFloat(
                                        rubrica.PUNTUACION_NO_AJUSTADA
                                    ) || 0,
                                PESO_RUBRICA: rubrica.PESO_RUBRICA || 0,
                                criterios: rubrica.criterios.map(
                                    (criterio) => ({
                                        ID_CRITERIO: criterio.ID_CRITERIO,
                                        NOMBRE_CRITERIO:
                                            criterio.NOMBRE_CRITERIO ||
                                            "Sin Nombre",
                                        PESO_CRITERIO:
                                            criterio.PESO_CRITERIO || 0,
                                        PUNTUACION_OBTENIDA:
                                            parseFloat(
                                                criterio.PUNTUACION_OBTENIDA
                                            ) || 0,
                                        PUNTUACION_SIN_AJUSTAR:
                                            parseFloat(
                                                criterio.PUNTUACION_NO_AJUSTADA
                                            ) || 0,
                                    })
                                ),
                            })
                        );
                    setRubricas(mappedRubricas);
                    setRevisionDate(
                        evaluationResponse.data.FECHA_REVISION || ""
                    );
                }
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            }
        };

        fetchData();
    }, [projectId, estudianteId, etapaId]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const toggleExpandRubrica = (rubricaId) => {
        setExpandedRubricas((prev) => ({
            ...prev,
            [rubricaId]: !prev[rubricaId],
        }));
    };

    const handleSaveEvaluation = async () => {
        try {
            // Validar que todas las rúbricas y criterios tengan puntuaciones correctas
            const isValid = rubricas.every((rubrica) =>
                rubrica.criterios.every((criterio) => {
                    // Encontrar el máximo permitido según los niveles del criterio
                    const maxPuntos = Math.max(
                        ...criterio.niveles.map((nivel) => nivel.PUNTOS)
                    );

                    return (
                        criterio.PUNTUACION_SIN_AJUSTAR !== undefined && // Está definido
                        criterio.PUNTUACION_SIN_AJUSTAR >= 0 && // No es negativo
                        criterio.PUNTUACION_SIN_AJUSTAR <= maxPuntos // No supera el máximo permitido
                    );
                })
            );

            if (!isValid) {
                alert(
                    "Por favor, completa todas las puntuaciones y asegúrate de que no sean negativas ni superen el máximo permitido."
                );
                return;
            }

            // Preparar los datos para el backend
            const evaluationData = {
                ID_ESTUDIANTE: estudianteId,
                ID_ETAPA: etapaId,
                ID_GRUPO: estudianteDetails.ID_GRUPO,
                FECHA_REVISION: revisionDate,
                rubricas: rubricas.map((rubrica) => ({
                    ID_RUBRICA: rubrica.ID_RUBRICA,
                    PESO_RUBRICA: rubrica.PESO_RUBRICA,
                    criterios: rubrica.criterios.map((criterio) => ({
                        ID_CRITERIO: criterio.ID_CRITERIO,
                        PUNTUACION_SIN_AJUSTAR:
                            criterio.PUNTUACION_SIN_AJUSTAR || 0, // Enviar solo puntuación sin ajustar
                        PESO_CRITERIO: criterio.PESO_CRITERIO || 0,
                    })),
                })),
            };

            console.log("Datos enviados al backend:", evaluationData);

            // Enviar datos al backend
            const response = await axios.post(
                "http://localhost:8000/api/evaluaciones-individuales-estudiantes",
                evaluationData,
                { withCredentials: true }
            );

            // Confirmar éxito
            alert("Evaluación guardada exitosamente.");
            console.log("Respuesta del servidor:", response.data);
        } catch (error) {
            console.error("Error al guardar la evaluación:", error);

            if (error.response) {
                console.error("Detalles del error:", error.response.data);
                alert(
                    `Hubo un error al guardar la evaluación: ${JSON.stringify(
                        error.response.data.errors
                    )}`
                );
            } else {
                alert(
                    "Ocurrió un error inesperado al guardar la evaluación. Inténtalo de nuevo."
                );
            }
        }
    };

    return (
        <div
            className={`evaluacion-individual-estudiante-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderProyecto />
            <div className="evaluacion-individual-estudiante-sidebar-content">
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                />
                <div className="evaluacion-individual-estudiante-content">
                    {/* Resumen del Estudiante y Grupo */}
                    <div className="evaluacion-grupo-individual-header">
                        <h2>
                            Evaluación Individual{" "}
                            {estudianteDetails?.NOMBRE_EST &&
                                `de ${estudianteDetails.NOMBRE_EST} ${estudianteDetails.APELLIDO_EST}`}
                        </h2>
                    </div>
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
                                    <strong>Rol:</strong>{" "}
                                    {estudianteDetails?.ROL_EST}
                                </p>
                                <p>
                                    <strong>Grupo:</strong>{" "}
                                    {groupInfo?.NOMBRE_GRUPO}
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
                                    value={revisionDate}
                                    onChange={(e) =>
                                        setRevisionDate(e.target.value)
                                    }
                                    className="date-picker"
                                />
                            </div>
                        </div>
                    </div>
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

                    {/* Puntuaciones Obtenidas */}
                    <div className="evaluacion-individual-rubricas-container">
                        <h3>Puntuaciones Obtenidas</h3>
                        <ul className="puntuaciones-resumen-list">
                            {rubricas.length > 0 ? (
                                rubricas.map((rubrica) => {
                                    // Validar que la rúbrica tenga criterios
                                    const criterios = rubrica.criterios || [];

                                    // Sumar las puntuaciones sin ajustar y ajustadas
                                    const puntuacionSinAjustar =
                                        criterios.reduce(
                                            (total, criterio) =>
                                                total +
                                                (criterio.PUNTUACION_SIN_AJUSTAR ||
                                                    0),
                                            0
                                        );

                                    const puntuacionAjustada = criterios.reduce(
                                        (total, criterio) =>
                                            total +
                                            (criterio.PUNTUACION_OBTENIDA || 0),
                                        0
                                    );

                                    // Peso sin ajustar y ajustado
                                    const pesoSinAjustar =
                                        rubrica.PESO_RUBRICA || 0;
                                    const pesoAjustado = Math.round(
                                        (pesoSinAjustar / 100) *
                                            (etapaDetails.ETAPAS_PUNTUACION ||
                                                0)
                                    );

                                    return (
                                        <li
                                            key={rubrica.ID_RUBRICA}
                                            className="puntuaciones-resumen-item"
                                        >
                                            <span className="rubrica-nombre">
                                                {rubrica.NOMBRE_RUBRICA}
                                            </span>
                                            <span className="rubrica-puntuacion">
                                                Sin ajustar:{" "}
                                                {puntuacionSinAjustar.toFixed(
                                                    2
                                                )}{" "}
                                                / {pesoSinAjustar.toFixed(2)}
                                            </span>
                                            <span className="rubrica-puntuacion-ajustada">
                                                Ajustada:{" "}
                                                {puntuacionAjustada.toFixed(2)}{" "}
                                                / {pesoAjustado.toFixed(2)}
                                            </span>
                                        </li>
                                    );
                                })
                            ) : (
                                <p>
                                    No se encontraron rúbricas para esta etapa.
                                </p>
                            )}

                            {/* Total de puntuaciones */}
                            <li className="puntuaciones-resumen-total">
                                <span className="rubrica-nombre-total">
                                    Total
                                </span>

                                <span className="rubrica-puntuacion-total">
                                    Sin ajustar:{" "}
                                    {rubricas
                                        .reduce((total, rubrica) => {
                                            return (
                                                total +
                                                (
                                                    rubrica.criterios || []
                                                ).reduce(
                                                    (
                                                        criterioTotal,
                                                        criterio
                                                    ) => {
                                                        // Asegúrate de que 'PUNTUACION_SIN_AJUSTAR' esté bien definido
                                                        const puntuacionCriterioSinAjustar =
                                                            parseFloat(
                                                                criterio.PUNTUACION_SIN_AJUSTAR
                                                            ) || 0;
                                                        return (
                                                            criterioTotal +
                                                            puntuacionCriterioSinAjustar
                                                        );
                                                    },
                                                    0
                                                )
                                            );
                                        }, 0)
                                        .toFixed(2)}{" "}
                                    /{" "}
                                    {rubricas
                                        .reduce(
                                            (total, rubrica) =>
                                                total +
                                                (rubrica.PESO_RUBRICA || 0),
                                            0
                                        )
                                        .toFixed(2)}
                                </span>

                                <span className="rubrica-puntuacion-ajustada-total">
                                    Ajustada:{" "}
                                    {rubricas
                                        .reduce(
                                            (total, rubrica) =>
                                                total +
                                                (
                                                    rubrica.criterios || []
                                                ).reduce(
                                                    (criterioTotal, criterio) =>
                                                        criterioTotal +
                                                        (parseFloat(
                                                            criterio.PUNTUACION_OBTENIDA
                                                        ) || 0), // Asegúrate de que sea un número
                                                    0
                                                ),
                                            0
                                        )
                                        .toFixed(2)}{" "}
                                    /{" "}
                                    {etapaDetails.ETAPAS_PUNTUACION
                                        ? parseFloat(
                                              etapaDetails.ETAPAS_PUNTUACION
                                          ).toFixed(2)
                                        : "N/A"}
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Mostrar Rúbricas, Criterios y Niveles */}
                    <div className="evaluacion-individual-rubricas-container">
                        <h3>
                            Rúbricas de{" "}
                            {rubricas.length > 0
                                ? etapaDetails.ETAPAS_TITULO
                                : "la Etapa"}
                        </h3>
                        <div className="evaluacion-individual-list">
                            {rubricas.length > 0 ? (
                                rubricas.map((rubrica) => (
                                    <div
                                        key={rubrica.ID_RUBRICA}
                                        className="rubrica-section organized-column"
                                    >
                                        <div className="rubrica-header">
                                            <h4>{rubrica.NOMBRE_RUBRICA}</h4>
                                            <div className="rubrica-header-info">
                                                <span className="peso-total">
                                                    Peso Total:{" "}
                                                    {rubrica.PESO_RUBRICA}
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
                                                                rubrica
                                                                    .ID_RUBRICA
                                                            ]
                                                                ? "fa-chevron-up"
                                                                : "fa-chevron-down"
                                                        }`}
                                                    ></i>
                                                </button>
                                            </div>
                                        </div>
                                        {expandedRubricas[
                                            rubrica.ID_RUBRICA
                                        ] && (
                                            <div className="rubrica-details-specific">
                                                <div className="criterios-container-specific">
                                                    {rubrica.criterios?.map(
                                                        (criterio) => (
                                                            <div
                                                                key={
                                                                    criterio.ID_CRITERIO
                                                                }
                                                                className="criterio-section-specific"
                                                            >
                                                                <div className="criterio-header-specific">
                                                                    <h5 className="criterio-title-specific">
                                                                        {
                                                                            criterio.NOMBRE_CRITERIO
                                                                        }
                                                                    </h5>
                                                                    <span className="criterio-peso-specific">
                                                                        Peso:{" "}
                                                                        {
                                                                            criterio.PESO_CRITERIO
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <p className="criterio-description-specific">
                                                                    {criterio.DESCRIPCION_CRITERIO ||
                                                                        "Sin descripción"}
                                                                </p>
                                                                <div className="criterio-calificacion-container-specific">
                                                                    <label
                                                                        htmlFor={`calificacion-sin-ajustar-${criterio.ID_CRITERIO}`}
                                                                    >
                                                                        Sin
                                                                        ajustar:
                                                                    </label>
                                                                    <select
                                                                        id={`calificacion-sin-ajustar-${criterio.ID_CRITERIO}`}
                                                                        className="criterio-calificacion-dropdown-specific"
                                                                        value={
                                                                            criterio.PUNTUACION_SIN_AJUSTAR ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            const value =
                                                                                parseFloat(
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                ) ||
                                                                                0;
                                                                            setRubricas(
                                                                                (
                                                                                    prev
                                                                                ) =>
                                                                                    prev.map(
                                                                                        (
                                                                                            r
                                                                                        ) =>
                                                                                            r.ID_RUBRICA ===
                                                                                            rubrica.ID_RUBRICA
                                                                                                ? {
                                                                                                      ...r,
                                                                                                      criterios:
                                                                                                          r.criterios.map(
                                                                                                              (
                                                                                                                  c
                                                                                                              ) =>
                                                                                                                  c.ID_CRITERIO ===
                                                                                                                  criterio.ID_CRITERIO
                                                                                                                      ? {
                                                                                                                            ...c,
                                                                                                                            PUNTUACION_SIN_AJUSTAR:
                                                                                                                                value,
                                                                                                                        }
                                                                                                                      : c
                                                                                                          ),
                                                                                                  }
                                                                                                : r
                                                                                    )
                                                                            );
                                                                        }}
                                                                    >
                                                                        <option value="">
                                                                            Seleccione
                                                                            una
                                                                            opción
                                                                        </option>
                                                                        {criterio.niveles?.map(
                                                                            (
                                                                                nivel
                                                                            ) => (
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
                                                                                    -{" "}
                                                                                    {
                                                                                        nivel.PUNTOS
                                                                                    }{" "}
                                                                                    puntos
                                                                                </option>
                                                                            )
                                                                        )}
                                                                    </select>
                                                                </div>
                                                                <div className="criterio-calificacion-ajustada">
                                                                    <strong>
                                                                        Ajustada:
                                                                    </strong>{" "}
                                                                    {criterio.PUNTUACION_OBTENIDA ||
                                                                        0}{" "}
                                                                    /{" "}
                                                                    {Math.round(
                                                                        (criterio.PESO_CRITERIO /
                                                                            100) *
                                                                            (etapaDetails.ETAPAS_PUNTUACION ||
                                                                                0)
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>
                                    No se encontraron rúbricas para esta etapa.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="evaluacion-individual-save-button">
                        <button
                            onClick={handleSaveEvaluation}
                            className="save-evaluation-btn"
                        >
                            Guardar Evaluación
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvaluacionIndividualEstudiantee;
