import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Table } from "antd";
import HeaderProyecto from "../Components/HeaderProyecto";
import SidebarPrueba from "../Components/SidebarPrueba";
import Reportes from "../Components/Reportes"; // Asegúrate de usar la ruta correcta
import "../../css/HeaderProyecto.css";
import "../../css/SidebarPrueba.css";
import "../../css/PlanillaDeSeguimiento.css";
import axios from "axios";

const PlanillaDeSeguimiento = () => {
    const { projectId } = useParams();
    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [projectData, setProjectData] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [studentsData, setStudentsData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (projectId) {
            const fetchProjectDetails = async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:8000/api/proyectos/${projectId}`,
                        { withCredentials: true }
                    );
                    setProjectDetails(response.data);
                } catch (error) {
                    console.error("Error al cargar el proyecto:", error);
                }
            };

            const fetchProjectData = async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:8000/api/proyectos/${projectId}/grupos`,
                        { withCredentials: true }
                    );
                    setProjectData(response.data.groups || []);
                } catch (error) {
                    console.error(
                        "Error al obtener los datos del proyecto:",
                        error
                    );
                }
            };

            fetchProjectDetails();
            fetchProjectData();
        } else {
            console.error("No se pudo obtener el projectId");
        }
    }, [projectId]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const generateColumns = () => {
        const etapasMap = {};
        const fechasDefensa =
            projectData.find(
                (group) => group.ID_GRUPO === parseInt(selectedGroup)
            )?.fechas_defensa || [];

        // Generar columnas dinámicas para las etapas
        studentsData.forEach((student) => {
            student.notas.forEach((nota) => {
                const diaDefensa =
                    Array.isArray(fechasDefensa) && fechasDefensa.length > 0
                        ? fechasDefensa[0]?.DIA || "Sin día"
                        : "Sin día";
    
                const columnKey = `${nota.ETAPA_TITULO}_${nota.FECHA_REVISION}`;
                const isNonEditable =
                    nota.isEvaluacionPares ||
                    nota.isEvaluacionCruzada ||
                    nota.isAutoevaluacion;
    
                if (!etapasMap[columnKey]) {
                    etapasMap[columnKey] = {
                        title: (
                            <div>
                                <div>{nota.FECHA_REVISION}</div>
                                <div>{diaDefensa}</div>
                            </div>
                        ),
                        parent: `${nota.ETAPA_TITULO} (${nota.ETAPA_PUNTUACION})`,
                        dataIndex: columnKey,
                        key: columnKey,
                        align: "center",
                        render: (value, record) => {
                            if (isNonEditable) {
                                // Si es no editable, solo muestra el valor
                                return value ? Math.round(value) : "-";
                            }
    
                            if (isEditing) {
                                return (
                                    <input
                                        type="number"
                                        value={Math.round(value) || ""}
                                        onChange={(e) => {
                                            const newValue = Math.floor(
                                                parseFloat(e.target.value)
                                            );
    
                                            if (newValue < 0) {
                                                alert(
                                                    "La nota no puede ser negativa."
                                                );
                                                return;
                                            }
    
                                            const maxPuntuacion = studentsData
                                                .find(
                                                    (stu) =>
                                                        stu.estudiante
                                                            .ID_ESTUDIANTE ===
                                                        record.key
                                                )
                                                ?.notas.find(
                                                    (n) =>
                                                        `${n.ETAPA_TITULO}_${n.FECHA_REVISION}` ===
                                                        columnKey
                                                )?.ETAPA_PUNTUACION;
    
                                            if (newValue > maxPuntuacion) {
                                                alert(
                                                    `La nota no puede ser mayor a ${maxPuntuacion} puntos.`
                                                );
                                                return;
                                            }
    
                                            const updatedData = studentsData.map(
                                                (stu) => {
                                                    if (
                                                        stu.estudiante
                                                            .ID_ESTUDIANTE ===
                                                        record.key
                                                    ) {
                                                        stu.notas = stu.notas.map(
                                                            (n) =>
                                                                `${n.ETAPA_TITULO}_${n.FECHA_REVISION}` ===
                                                                columnKey
                                                                    ? {
                                                                          ...n,
                                                                          PUNTUACION_TOTAL:
                                                                              newValue,
                                                                      }
                                                                    : n
                                                        );
                                                    }
                                                    return stu;
                                                }
                                            );
                                            setStudentsData(updatedData);
                                        }}
                                        style={{
                                            textAlign: "center",
                                            padding: "4px 6px",
                                            width: "auto",
                                            minWidth: "60px",
                                            maxWidth: "100px",
                                        }}
                                    />
                                );
                            }
    
                            return value ? Math.round(value) : "-";
                        },
                    };
                }
            });
        });

        const dynamicColumns = Object.values(etapasMap).reduce(
            (acc, column) => {
                const parentIndex = acc.findIndex(
                    (col) => col.title === column.parent
                );
                if (parentIndex === -1) {
                    acc.push({
                        title: column.parent,
                        align: "center",
                        children: [column],
                    });
                } else {
                    acc[parentIndex].children.push(column);
                }
                return acc;
            },
            []
        );

        const fixedColumns = [
            {
                title: "Estudiantes",
                dataIndex: "nombreCompleto",
                key: "nombreCompleto",
                fixed: "left",
                width: 200,
            },
        ];

        const totalColumn = {
            title: "Nota Sumativa",
            dataIndex: "total",
            key: "total",
            fixed: "right",
            width: 150,
            align: "center",
            render: (_, row) => {
                const total = Object.keys(row)
                    .filter((key) => key.includes("_"))
                    .reduce((sum, key) => sum + (parseFloat(row[key]) || 0), 0);
                return Math.round(total);
            },
        };

        const retrasoColumn = {
            title: "Retraso",
            dataIndex: "retraso",
            key: "retraso",
            fixed: "right",
            width: 100,
            align: "center",
            render: (value) => value || 0,
        };

        const ausenciaInjustificadaColumn = {
            title: "Ausencia Injustificada",
            dataIndex: "ausenciaInjustificada",
            key: "ausenciaInjustificada",
            fixed: "right",
            width: 150,
            align: "center",
            render: (value) => value || 0,
        };

        const ausenciaJustificadaColumn = {
            title: "Ausencia Justificada",
            dataIndex: "ausenciaJustificada",
            key: "ausenciaJustificada",
            fixed: "right",
            width: 150,
            align: "center",
            render: (value) => value || 0,
        };

        setColumns([
            ...fixedColumns,
            ...dynamicColumns,
            totalColumn,
            retrasoColumn,
            ausenciaInjustificadaColumn,
            ausenciaJustificadaColumn,
        ]);
    };

    useEffect(() => {
        if (selectedGroup && studentsData.length > 0) {
            generateColumns();
        }
    }, [isEditing, studentsData, selectedGroup]);

    const handleGroupSelection = async (event) => {
        const groupId = event.target.value;
        setSelectedGroup(groupId);
    
        if (groupId) {
            try {
                const [
                    notasResponse,
                    evaluacionesCruzadasResponse,
                    autoevaluacionesResponse,
                    evaluacionParesResponse,
                ] = await Promise.all([
                    axios.get(
                        `http://localhost:8000/api/grupos/${groupId}/notas`,
                        { withCredentials: true }
                    ),
                    axios.get(
                        `http://localhost:8000/api/evaluaciones-cruzadas/grupos/${groupId}/notas`,
                        { withCredentials: true }
                    ),
                    axios.get(
                        `http://localhost:8000/api/autoevaluaciones/grupos/${groupId}/notas`,
                        { withCredentials: true }
                    ),
                    axios.get(
                        `http://localhost:8000/api/grupos/${groupId}/proyecto/${projectId}/promedio-notas`,
                        { withCredentials: true }
                    ),
                ]);
    
                const combinedData = notasResponse.data.map((estudiante) => {
                    const evaluacionParesNotas =
                        evaluacionParesResponse.data.find(
                            (paresData) =>
                                paresData.estudiante.ID_ESTUDIANTE ===
                                estudiante.estudiante.ID_ESTUDIANTE
                        )?.notas.map((nota) => ({
                            ...nota,
                            isEvaluacionPares: true,
                        })) || [];
    
                    const evaluacionCruzadaNotas =
                        evaluacionesCruzadasResponse.data.find(
                            (evalData) =>
                                evalData.estudiante.ID_ESTUDIANTE ===
                                estudiante.estudiante.ID_ESTUDIANTE
                        )?.notas.map((nota) => ({
                            ...nota,
                            isEvaluacionCruzada: true,
                        })) || [];
    
                    const autoevaluacionNotas =
                        autoevaluacionesResponse.data.find(
                            (autoEvalData) =>
                                autoEvalData.estudiante.ID_ESTUDIANTE ===
                                estudiante.estudiante.ID_ESTUDIANTE
                        )?.notas.map((nota) => ({
                            ...nota,
                            isAutoevaluacion: true,
                        })) || [];
    
                    return {
                        ...estudiante,
                        notas: [
                            ...estudiante.notas,
                            ...evaluacionParesNotas,
                            ...evaluacionCruzadaNotas,
                            ...autoevaluacionNotas,
                        ],
                    };
                });
    
                setStudentsData(combinedData || []);
            } catch (error) {
                console.error("Error al obtener datos del grupo:", error);
            }
        }
    };
    
    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            // Excluir autoevaluaciones y evaluaciones cruzadas
            const payload = studentsData.map((student) => ({
                ID_ESTUDIANTE: student.estudiante.ID_ESTUDIANTE,
                notas: student.notas.filter(
                    (nota) =>
                        !nota.isEvaluacionPares &&
                        !nota.isEvaluacionCruzada &&
                        !nota.isAutoevaluacion
                ),
            }));
            

            // Realiza el POST al backend
            await axios.post(
                `http://localhost:8000/api/grupos/${selectedGroup}/notas`,
                { studentsData: payload },
                { withCredentials: true }
            );

            console.log("Notas actualizadas exitosamente.");
            setIsEditing(false);
        } catch (error) {
            console.error("Error al guardar las notas:", error);
        }
    };

    // Transforma los datos de estudiantes para la tabla
    const dataForTable = studentsData.map((student) => {
        const row = {
            key: student.estudiante.ID_ESTUDIANTE,
            nombreCompleto: `${student.estudiante.NOMBRE} ${student.estudiante.APELLIDO}`,
            retraso: student.notas.filter((nota) => nota.RETRASO).length, // Cuenta las veces que hay retrasos
            ausenciaInjustificada: student.notas.filter(
                (nota) => nota.FALTA === true // Cuenta las veces que hay faltas (ausencias injustificadas)
            ).length,
            ausenciaJustificada: student.notas.filter(
                (nota) =>
                    nota.FALTA === false &&
                    parseFloat(nota.PUNTUACION_TOTAL) === 0 // Ausencias justificadas
            ).length,
        };

        // Agrega las puntuaciones por etapa a las columnas dinámicas
        student.notas.forEach((nota) => {
            const columnKey = `${nota.ETAPA_TITULO}_${nota.FECHA_REVISION}`;
            row[columnKey] = nota.PUNTUACION_TOTAL;
        });

        return row;
    });

    return (
        <div
            className={`planilla-seguimiento-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderProyecto />
            <div className="planilla-seguimiento-sidebar-content">
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                />
                <div className="container">
                    <div className="projects-header">
                        <h2>Planilla de Seguimiento</h2>
                        <button className="new-project-btn">
                            Exportar a Excel
                        </button>
                    </div>

                    <div className="dropdown-container">
                        <label htmlFor="groupDropdown">
                            Selecciona un grupo:
                        </label>
                        <select
                            id="groupDropdown"
                            value={selectedGroup || ""}
                            onChange={handleGroupSelection}
                        >
                            <option value="" disabled>
                                Seleccionar grupo
                            </option>
                            {Array.isArray(projectData) &&
                            projectData.length > 0 ? (
                                projectData.map((group) => (
                                    <option
                                        key={group.ID_GRUPO}
                                        value={group.ID_GRUPO}
                                    >
                                        {group.NOMBRE_GRUPO}
                                    </option>
                                ))
                            ) : (
                                <option disabled>
                                    No hay grupos disponibles
                                </option>
                            )}
                        </select>
                    </div>

                    {selectedGroup ? (
                        <div className="group-details">
                            <h3>Estudiantes y Notas</h3>
                            {dataForTable.length > 0 ? (
                                <>
                                    {/* Contenedor con scroll horizontal para etapas */}
                                    <div
                                        className="etapas-scroll-container"
                                        style={{
                                            overflowX: "auto",
                                            overflowY: "hidden",
                                            paddingBottom: "10px",
                                        }}
                                    >
                                        <Table
                                            className="custom-table"
                                            columns={columns}
                                            dataSource={dataForTable}
                                            pagination={false}
                                            bordered
                                            size="middle"
                                            rowClassName={(record) =>
                                                record.total >= 50
                                                    ? "highlight-row"
                                                    : ""
                                            }
                                            onRow={(record) => ({
                                                style: { textAlign: "center" }, // Centra el contenido de todas las filas
                                            })}
                                        />
                                    </div>
                                    {/* Botón debajo de la tabla */}
                                    <div className="edit-notes-btn-container">
                                        {!isEditing ? (
                                            <button
                                                className="new-project-btn"
                                                onClick={handleEdit}
                                            >
                                                Editar Notas
                                            </button>
                                        ) : (
                                            <button
                                                className="new-project-btn"
                                                onClick={handleSave}
                                            >
                                                Guardar
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="no-data-message">
                                    No hay estudiantes registrados o notas
                                    disponibles.
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="no-data-message">
                            Seleccione un grupo para ver detalles.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlanillaDeSeguimiento;
