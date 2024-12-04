import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import EvaluationSidebar from "../../Components/ComponentsEvaluacionIndividualEstudiante/EvaluationSidebar";
import EvaluationHeader from "../../Components/ComponentsEvaluacionIndividualEstudiante/EvaluationHeader";
import StudentSummary from "../../Components/ComponentsEvaluacionIndividualEstudiante/StudentSummary";
import EtapaSummary from "../../Components/ComponentsEvaluacionIndividualEstudiante/EtapaSummary";
import RubricasSummary from "../../Components/ComponentsEvaluacionIndividualEstudiante/RubricasSummary";
import RubricaDetails from "../../Components/ComponentsEvaluacionIndividualEstudiante/RubricaDetails";
import SaveEvaluationButton from "../../Components/ComponentsEvaluacionIndividualEstudiante/SaveEvaluationButton";
import "../../../css/EstilosEvaluaciones/EvaluacionIndividualEstudiante.css";
import axios from "axios";

const EvaluacionIndividualEstudiante = () => {
    const { projectId, estudianteId, etapaId } = useParams();
    const [projectDetails, setProjectDetails] = useState({});
    const [etapaDetails, setEtapaDetails] = useState({});
    const [estudianteDetails, setEstudianteDetails] = useState({});
    const [rubricas, setRubricas] = useState([]);
    const [groupInfo, setGroupInfo] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedRubricas, setExpandedRubricas] = useState({});
    const [defenseDate, setDefenseDate] = useState(null);
    const [revisionDate, setRevisionDate] = useState("");
    const [evaluationId, setEvaluationId] = useState(null);
    const [falta, setFalta] = useState(false);
    const [retraso, setRetraso] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        fetchData();
    }, [projectId, estudianteId, etapaId]);

    const fetchData = async () => {
        try {
            const [
                projectRes,
                studentRes,
                etapaRes,
                rubricasRes,
                defenseRes,
                evaluationRes,
            ] = await Promise.all([
                axios.get(`http://localhost:8000/api/proyectos/${projectId}`, {
                    withCredentials: true,
                }),
                axios.get(
                    `http://localhost:8000/api/estudiantes/${estudianteId}`,
                    { withCredentials: true }
                ),
                axios.get(`http://localhost:8000/api/etapas/${etapaId}`, {
                    withCredentials: true,
                }),
                axios.get(
                    `http://localhost:8000/api/rubricas/${projectId}/${etapaId}`,
                    { withCredentials: true }
                ),
                axios.get(
                    `http://localhost:8000/api/defensa/grupo/${estudianteId}`,
                    { withCredentials: true }
                ),
                axios.get(
                    `http://localhost:8000/api/evaluaciones/${estudianteId}/${etapaId}`,
                    { withCredentials: true }
                ),
            ]);

            setProjectDetails(projectRes.data);
            setEstudianteDetails(studentRes.data);
            if (studentRes.data.ID_GRUPO) {
                const groupRes = await axios.get(
                    `http://localhost:8000/api/grupos/${studentRes.data.ID_GRUPO}`,
                    { withCredentials: true }
                );
                setGroupInfo(groupRes.data);
            }
            setEtapaDetails(etapaRes.data);
            setDefenseDate(defenseRes.data);

            // Procesar rúbricas
            const rubricasWithCriteria = rubricasRes.data.map((rubrica) => ({
                ...rubrica,
                criterios: rubrica.criterios.map((criterio) => ({
                    ...criterio,
                    PUNTUACION_SIN_AJUSTAR:
                        parseFloat(criterio.PUNTUACION_SIN_AJUSTAR) || 0,
                    DESCRIPCION_CRITERIO:
                        criterio.DESCRIPCION_CRITERIO || "Sin descripción",
                    niveles: criterio.niveles || [],
                })),
            }));
            setRubricas(rubricasWithCriteria);

            // Procesar evaluación si existe
            if (evaluationRes.data) {
                const mappedRubricas = evaluationRes.data.notas_rubricas.map(
                    (rubrica) => ({
                        ...rubrica,
                        criterios: rubrica.criterios.map((criterio) => ({
                            ...criterio,
                            PUNTUACION_SIN_AJUSTAR:
                                parseFloat(criterio.PUNTUACION_NO_AJUSTADA) ||
                                0,
                            PUNTUACION_OBTENIDA:
                                parseFloat(criterio.PUNTUACION_OBTENIDA) || 0,
                        })),
                    })
                );
                setRubricas(mappedRubricas);
                setRevisionDate(evaluationRes.data.FECHA_REVISION || "");
                setEvaluationId(evaluationRes.data.ID_EVALUACION);
                setFalta(evaluationRes.data.FALTA || false);
                setRetraso(evaluationRes.data.RETRASO || false);
            }
        } catch (error) {
            console.error("Error al cargar los datos:", error);
        }
    };

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const toggleExpandRubrica = (rubricaId) => {
        setExpandedRubricas((prev) => ({
            ...prev,
            [rubricaId]: !prev[rubricaId],
        }));
    };

    const handleSaveEvaluation = async () => {
        if (falta) {
            alert("No se puede evaluar a un estudiante con falta.");
            return;
        }

        if (!revisionDate) {
            alert("Por favor, ingrese la fecha de revisión antes de guardar.");
            return;
        }

        try {
            // Preparar los datos de las rúbricas
            const rubricasData = rubricas.map((rubrica) => ({
                ID_RUBRICA: rubrica.ID_RUBRICA,
                PESO_RUBRICA: rubrica.PESO_RUBRICA,
                criterios: rubrica.criterios.map((criterio) => ({
                    ID_CRITERIO: criterio.ID_CRITERIO,
                    PUNTUACION_SIN_AJUSTAR:
                        criterio.PUNTUACION_SIN_AJUSTAR || 0,
                    PESO_CRITERIO: criterio.PESO_CRITERIO || 0,
                })),
            }));

            const evaluationData = {
                rubricas: rubricasData,
                FECHA_REVISION: revisionDate,
            };

            if (evaluationId) {
                // Actualizar evaluación existente
                await axios.put(
                    `http://localhost:8000/api/evaluaciones-individuales-estudiantes/${evaluationId}`,
                    evaluationData,
                    { withCredentials: true }
                );
                alert("Evaluación actualizada exitosamente.");
            } else {
                // Crear nueva evaluación
                await axios.post(
                    "http://localhost:8000/api/evaluaciones-individuales-estudiantes",
                    {
                        ...evaluationData,
                        ID_ESTUDIANTE: estudianteId,
                        ID_ETAPA: etapaId,
                        ID_GRUPO: estudianteDetails.ID_GRUPO,
                    },
                    { withCredentials: true }
                );
                alert("Evaluación guardada exitosamente.");
            }
        } catch (error) {
            console.error("Error al guardar la evaluación:", error);
            alert(
                error.response?.data?.message ||
                    "Ocurrió un error al guardar la evaluación."
            );
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
                <EvaluationSidebar
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    projectDetails={projectDetails}
                    projectId={projectId}
                />
                <div className="evaluacion-individual-estudiante-content">
                    <EvaluationHeader estudianteDetails={estudianteDetails} />
                    <StudentSummary
                        estudianteDetails={estudianteDetails}
                        groupInfo={groupInfo}
                        defenseDate={defenseDate}
                        revisionDate={revisionDate}
                        setRevisionDate={setRevisionDate}
                    />
                    <EtapaSummary etapaDetails={etapaDetails} />
                    <RubricasSummary
                        rubricas={rubricas}
                        etapaDetails={etapaDetails}
                    />
                    <RubricaDetails
                        rubricas={rubricas}
                        expandedRubricas={expandedRubricas}
                        toggleExpandRubrica={toggleExpandRubrica}
                        setRubricas={setRubricas}
                        etapaDetails={etapaDetails}
                    />
                    <SaveEvaluationButton
                        handleSaveEvaluation={handleSaveEvaluation}
                    />
                </div>
            </div>
        </div>
    );
};

export default EvaluacionIndividualEstudiante;
