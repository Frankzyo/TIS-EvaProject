import React from "react";
import { Table } from "antd";

const Reportes = ({
    studentsData,
    autoevalResults,
    cruzadasResults,
    paresResults,
}) => {
    const safeStudentsData = studentsData || [];
    const safeAutoevalResults = autoevalResults || [];
    const safeCruzadasResults = cruzadasResults || [];
    const safeParesResults = paresResults || [];

    // Datos para la tabla principal
    const calificacionesData = safeStudentsData.map((student) => {
        const etapas = (student.notas || []).map((nota, index) => ({
            key: `etapa-${index}`,
            etapa: `${nota.ETAPA_TITULO || "Sin título"}`, // Prefijo para etapas
            calificacion: Math.round(nota.PUNTUACION_TOTAL) || 0,
            maxima: Math.round(nota.ETAPA_PUNTUACION) || 0,
        }));

        const autoevaluaciones = safeAutoevalResults
            .filter(
                (result) =>
                    result.estudiante.ID_ESTUDIANTE ===
                    student.estudiante.ID_ESTUDIANTE
            )
            .flatMap((result, index) =>
                result.notas.map((nota, notaIndex) => ({
                    key: `auto-${index}-${notaIndex}`,
                    titulo: `${nota.ETAPA_TITULO || "Sin título"}`, // Prefijo para autoevaluaciones
                    calificacion: Math.round(nota.PUNTUACION_TOTAL) || 0,
                    maxima: Math.round(nota.ETAPA_PUNTUACION) || 0,
                }))
            );

        const cruzadas = safeCruzadasResults
            .filter(
                (result) =>
                    result.estudiante.ID_ESTUDIANTE ===
                    student.estudiante.ID_ESTUDIANTE
            )
            .flatMap((result, index) =>
                result.notas.map((nota, notaIndex) => ({
                    key: `cruzada-${index}-${notaIndex}`,
                    titulo: `${nota.ETAPA_TITULO || "Sin título"}`, // Prefijo para cruzadas
                    calificacion: Math.round(nota.PUNTUACION_TOTAL) || 0,
                    maxima: Math.round(nota.ETAPA_PUNTUACION) || 0,
                }))
            );

        const pares = safeParesResults
            .filter(
                (result) =>
                    result.estudiante.ID_ESTUDIANTE ===
                    student.estudiante.ID_ESTUDIANTE
            )
            .flatMap((result, index) =>
                result.notas.map((nota, notaIndex) => ({
                    key: `par-${index}-${notaIndex}`,
                    titulo: `${nota.ETAPA_TITULO || "Sin título"}`, // Prefijo para pares
                    calificacion: Math.round(nota.PUNTUACION_TOTAL) || 0,
                    maxima: Math.round(nota.ETAPA_PUNTUACION) || 0,
                }))
            );

        const totalCalificaciones = etapas.reduce(
            (sum, etapa) => sum + etapa.calificacion,
            0
        );
        const totalAutoevaluaciones = autoevaluaciones.reduce(
            (sum, auto) => sum + auto.calificacion,
            0
        );
        const totalCruzadas = cruzadas.reduce(
            (sum, cruzada) => sum + cruzada.calificacion,
            0
        );
        const totalPares = pares.reduce(
            (sum, par) => sum + par.calificacion,
            0
        );

        return {
            key: student.estudiante.ID_ESTUDIANTE,
            nombreCompleto: `${student.estudiante.NOMBRE} ${student.estudiante.APELLIDO}`,
            etapas,
            autoevaluaciones,
            cruzadas,
            pares,
            total:
                totalCalificaciones +
                totalAutoevaluaciones +
                totalCruzadas +
                totalPares,
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

        const totalCalificacion = calificacionesData.find(
            (calificacion) =>
                calificacion.key === student.estudiante.ID_ESTUDIANTE
        )?.total;

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
            estado,
        };
    });

    // Columnas principales
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

    // Columnas de detalle
    const detalleColumns = (titulo) => [
        {
            title: titulo,
            key: "titulo_etapa",
            render: (record) => {
                return (
                    <span>
                        {record.titulo || record.etapa || "Sin título"}{" "}
                        {/* Mostrar titulo o etapa */}
                    </span>
                );
            },
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
                columns={[
                    {
                        title: "Estudiante",
                        dataIndex: "nombreCompleto",
                        key: "nombreCompleto",
                    },
                    {
                        title: "Total Calificaciones",
                        dataIndex: "total",
                        key: "total",
                    },
                ]}
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
                                columns={detalleColumns("Etapa")}
                                dataSource={record.etapas}
                                pagination={false}
                                bordered
                                size="small"
                            />
                            <h4>Autoevaluaciones</h4>
                            <Table
                                className="custom-table"
                                columns={detalleColumns("Autoevaluación")}
                                dataSource={record.autoevaluaciones}
                                pagination={false}
                                bordered
                                size="small"
                            />
                            <h4>Evaluaciones Cruzadas</h4>
                            <Table
                                className="custom-table"
                                columns={detalleColumns("Evaluación Cruzada")}
                                dataSource={record.cruzadas}
                                pagination={false}
                                bordered
                                size="small"
                            />
                            <h4>Evaluaciones de Pares</h4>
                            <Table
                                className="custom-table"
                                columns={detalleColumns("Evaluación de Pares")}
                                dataSource={record.pares}
                                pagination={false}
                                bordered
                                size="small"
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
