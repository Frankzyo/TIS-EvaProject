import React from "react";
import { Table } from "antd";

const Reportes = ({ studentsData, autoevalResults }) => {
    const safeStudentsData = studentsData || [];
    const safeAutoevalResults = autoevalResults || [];

    // Datos para la tabla principal
    const calificacionesData = safeStudentsData.map((student) => {
        const etapas = (student.notas || []).map((nota) => ({
            etapa: nota.ETAPA_TITULO,
            calificacion: Math.round(nota.PUNTUACION_TOTAL) || 0,
            maxima: Math.round(nota.ETAPA_PUNTUACION) || 0,
        }));

        const totalCalificaciones = etapas.reduce(
            (sum, etapa) => sum + etapa.calificacion,
            0
        );

        const autoevaluaciones = safeAutoevalResults
            .filter(
                (result) => result.ID_EST === student.estudiante.ID_ESTUDIANTE
            )
            .map((auto) => ({
                titulo: auto.TITULO_AUTOEVAL,
                calificacion: Math.round(auto.PUNTUACION_OBTENIDA) || 0,
                maxima: Math.round(auto.PUNTUACION_MAXIMA_AUTOEVAL) || 0,
            }));

        const totalAutoevaluaciones = autoevaluaciones.reduce(
            (sum, auto) => sum + auto.calificacion,
            0
        );

        return {
            key: student.estudiante.ID_ESTUDIANTE,
            nombreCompleto: `${student.estudiante.NOMBRE} ${student.estudiante.APELLIDO}`,
            etapas,
            autoevaluaciones,
            total: totalCalificaciones + totalAutoevaluaciones,
        };
    });

    // Datos para el reporte de asistencia
    const asistenciaData = safeStudentsData.map((student) => {
        const totalEvaluaciones = student.notas.length;

        let presentes = 0;
        let retrasos = 0;
        let ausenciasInjustificadas = 0;
        let ausenciasJustificadas = 0;

        student.notas.forEach((nota) => {
            if (nota.PUNTUACION_TOTAL !== null && nota.PUNTUACION_TOTAL > 0) {
                presentes++;
                if (nota.RETRASO) {
                    retrasos++;
                }
            } else {
                if (nota.FALTA === true) {
                    ausenciasInjustificadas++;
                } else if (nota.FALTA === false) {
                    ausenciasJustificadas++;
                }
            }
        });

        const porcentajePresentes =
            ((presentes / totalEvaluaciones) * 100).toFixed(0) + "%";
        const porcentajeRetrasos =
            ((retrasos / totalEvaluaciones) * 100).toFixed(0) + "%";
        const porcentajeAusenciasInjustificadas =
            ((ausenciasInjustificadas / totalEvaluaciones) * 100).toFixed(0) +
            "%";
        const porcentajeAusenciasJustificadas =
            ((ausenciasJustificadas / totalEvaluaciones) * 100).toFixed(0) +
            "%";

        // Calcular la calificación total del estudiante
        const totalCalificacion = calificacionesData.find(
            (calificacion) =>
                calificacion.key === student.estudiante.ID_ESTUDIANTE
        )?.total;

        // Determinar el estado del estudiante
        const estado =
            ausenciasInjustificadas < 3 && totalCalificacion > 51
                ? "Aprobado"
                : "Reprobado";

        return {
            key: student.estudiante.ID_ESTUDIANTE,
            nombreCompleto: `${student.estudiante.NOMBRE} ${student.estudiante.APELLIDO}`,
            presentes,
            retrasos,
            ausenciasInjustificadas,
            ausenciasJustificadas,
            porcentajePresentes,
            porcentajeRetrasos,
            porcentajeAusenciasInjustificadas,
            porcentajeAusenciasJustificadas,
            estado, // Estado del estudiante
        };
    });

    // Columnas principales de la tabla
    const mainColumns = [
        {
            title: "Estudiante",
            dataIndex: "nombreCompleto",
            key: "nombreCompleto",
        },
        {
            title: "Total Calificaciones",
            dataIndex: "total",
            key: "total",
            render: (value) => Math.round(value) || 0,
        },
    ];

    // Columnas de detalle de etapas
    const etapasColumns = [
        {
            title: "Etapa",
            dataIndex: "etapa",
            key: "etapa",
        },
        {
            title: "Calificación Obtenida",
            dataIndex: "calificacion",
            key: "calificacion",
        },
        {
            title: "Puntuación Máxima",
            dataIndex: "maxima",
            key: "maxima",
        },
    ];

    // Columnas de detalle de autoevaluaciones
    const autoevalColumns = [
        {
            title: "Autoevaluación",
            dataIndex: "titulo",
            key: "titulo",
        },
        {
            title: "Calificación Obtenida",
            dataIndex: "calificacion",
            key: "calificacion",
        },
        {
            title: "Puntuación Máxima",
            dataIndex: "maxima",
            key: "maxima",
        },
    ];

    // Columnas para el reporte de asistencia
    const asistenciaColumns = [
        {
            title: "Estudiante",
            dataIndex: "nombreCompleto",
            key: "nombreCompleto",
        },
        {
            title: "Presentes",
            dataIndex: "presentes",
            key: "presentes",
        },
        {
            title: "Retrasos",
            dataIndex: "retrasos",
            key: "retrasos",
        },
        {
            title: "Ausencias Injustificadas",
            dataIndex: "ausenciasInjustificadas",
            key: "ausenciasInjustificadas",
        },
        {
            title: "Ausencias Justificadas",
            dataIndex: "ausenciasJustificadas",
            key: "ausenciasJustificadas",
        },
        {
            title: "Porcentaje de Asistencia",
            dataIndex: "porcentajePresentes",
            key: "porcentajePresentes",
        },
        {
            title: "Porcentaje de Retrasos",
            dataIndex: "porcentajeRetrasos",
            key: "porcentajeRetrasos",
        },
        {
            title: "Estado",
            dataIndex: "estado",
            key: "estado",
            render: (value) => (
                <span
                    style={{
                        color: value === "Reprobado" ? "red" : "green",
                        fontWeight: "bold",
                    }}
                >
                    {value}
                </span>
            ),
        },
    ];

    return (
        <div>
            <h3>Reporte de Calificaciones Detallado</h3>
            <Table
                className="custom-table"
                columns={mainColumns}
                dataSource={calificacionesData}
                pagination={false}
                bordered
                size="middle"
                expandable={{
                    expandedRowRender: (record) => (
                        <>
                            <h4>Calificaciones por Etapas</h4>
                            <Table
                                className="custom-table"
                                columns={etapasColumns}
                                dataSource={record.etapas}
                                pagination={false}
                                bordered
                                size="small"
                                rowKey={(row) => row.etapa}
                            />
                            <h4>Calificaciones de Autoevaluaciones</h4>
                            <Table
                                className="custom-table"
                                columns={autoevalColumns}
                                dataSource={record.autoevaluaciones}
                                pagination={false}
                                bordered
                                size="small"
                                rowKey={(row) => row.titulo}
                            />
                        </>
                    ),
                }}
            />
            <h3>Reporte de Asistencia</h3>
            <Table
                className="custom-table"
                columns={asistenciaColumns}
                dataSource={asistenciaData}
                pagination={false}
                bordered
                size="middle"
            />
        </div>
    );
};

export default Reportes;