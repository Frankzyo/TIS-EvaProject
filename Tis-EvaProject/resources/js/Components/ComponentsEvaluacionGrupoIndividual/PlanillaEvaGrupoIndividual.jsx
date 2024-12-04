import React, { useEffect, useState } from "react";
import { Table } from "antd";
import axios from "axios";

const PlanillaEvaGrupoIndividual = ({ grupoId, etapaId }) => {
    const [planillaNotas, setPlanillaNotas] = useState([]);
    const [etapaDetails, setEtapaDetails] = useState({
        titulo: "Cargando...",
        puntuacion: 0,
    });
    const [grupoDetails, setGrupoDetails] = useState({ nombre: "Cargando..." });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlanilla = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/evaluaciones/etapa/${etapaId}/grupo/${grupoId}`,
                    { withCredentials: true }
                );

                setEtapaDetails(
                    response.data.etapa || {
                        titulo: "Sin datos",
                        puntuacion: 0,
                    }
                );
                setGrupoDetails(response.data.grupo || { nombre: "Sin datos" });
                setPlanillaNotas(response.data.evaluaciones || []);
            } catch (error) {
                console.error(
                    "Error al cargar la planilla de evaluación:",
                    error
                );
            } finally {
                setIsLoading(false);
            }
        };

        if (grupoId && etapaId) {
            fetchPlanilla();
        }
    }, [grupoId, etapaId]);

    // Crear columnas dinámicas para las rúbricas
    const rubricaColumns =
        planillaNotas.length > 0 && planillaNotas[0]?.evaluacion?.rubricas
            ? planillaNotas[0].evaluacion.rubricas.map((rubrica) => ({
                  title: rubrica.nombre_rubrica,
                  dataIndex: "evaluacion",
                  key: `${rubrica.rubrica_id}_ajustada`,
                  render: (evaluacion) => {
                      const currentRubrica = evaluacion?.rubricas?.find(
                          (r) => r.rubrica_id === rubrica.rubrica_id
                      );
                      return currentRubrica
                          ? currentRubrica.puntuacion_ajustada
                          : "-";
                  },
                  width: 150,
              }))
            : [];

    // Configuración de las columnas principales
    const columns = [
        {
            title: "Estudiante",
            dataIndex: "estudiante",
            key: "estudiante",
            render: (estudiante) =>
                `${estudiante?.nombre || "Sin nombre"} ${
                    estudiante?.apellido || ""
                }`,
            fixed: "left",
            width: 200,
        },
        ...rubricaColumns,
        {
            title: "Puntuación Total",
            dataIndex: "evaluacion",
            key: "puntuacion_total",
            render: (evaluacion) =>
                evaluacion?.puntuacion_total
                    ? Math.round(evaluacion.puntuacion_total)
                    : "-",
            width: 150,
        },
        {
            title: "Fecha de Revisión",
            dataIndex: "evaluacion",
            key: "fecha_revision",
            render: (evaluacion) => evaluacion?.fecha_revision || "Sin revisar",
            width: 150,
        },
        {
            title: "Retraso (R)",
            dataIndex: "evaluacion",
            key: "retraso",
            render: (evaluacion) => (evaluacion?.retraso ? "Sí" : "No"),
            width: 100,
        },
        {
            title: "Falta (F)",
            dataIndex: "evaluacion",
            key: "falta",
            render: (evaluacion) => (evaluacion?.falta ? "Sí" : "No"),
            width: 100,
        },
    ];

    // Configuración del dataSource para la tabla
    const dataSource = planillaNotas.map((nota, index) => ({
        key: index,
        estudiante: nota.estudiante || { nombre: "Desconocido", apellido: "" },
        evaluacion: nota.evaluacion || {},
    }));

    if (isLoading) {
        return <p>Cargando planilla de evaluación...</p>;
    }

    return (
        <div className="planilla-eva-grupo-container">
            <h3 className="planilla-etapa-title">
                Etapa: {etapaDetails.titulo} | Puntuación Total Etapa:{" "}
                <span className="planilla-etapa-score">
                    {etapaDetails.puntuacion}
                </span>
            </h3>
            <h4 className="planilla-grupo-title">
                Grupo: {grupoDetails.nombre}
            </h4>

            <Table
                className="custom-table"
                columns={columns}
                dataSource={dataSource}
                bordered
                size="middle"
                pagination={false}
                locale={{ emptyText: "No hay datos disponibles." }}
            />
        </div>
    );
};

export default PlanillaEvaGrupoIndividual;
