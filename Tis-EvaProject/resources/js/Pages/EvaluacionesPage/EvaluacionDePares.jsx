import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import SidebarPrueba from "../../Components/ComponenteSidebar/SidebarPrueba";
import "../../../css/EstilosHeader/HeaderProyecto.css";
import "../../../css/EstilosSidebar/SidebarPrueba.css";
import "../../../css/EstilosEvaluaciones/EvaluacionDePares.css";
import axios from "axios";

const EvaluacionDePares = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [nuevaEvaluacion, setNuevaEvaluacion] = useState({
        grupoEvaluado: "",
        fechaEvaluacion: "",
    });
    const [fechaDefensa, setFechaDefensa] = useState({ dia: "", hora: "" });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectResponse, gruposResponse, evaluacionesResponse] =
                    await Promise.all([
                        axios.get(
                            `http://localhost:8000/api/proyectos/${projectId}`,
                            { withCredentials: true }
                        ),
                        axios.get(
                            `http://localhost:8000/api/proyectos/${projectId}/grupos-fechas`,
                            { withCredentials: true }
                        ),
                        axios.get(
                            `http://localhost:8000/api/evaluaciones-pares/proyecto/${projectId}`,
                            { withCredentials: true }
                        ),
                    ]);

                setProjectDetails(projectResponse.data);
                setGrupos(gruposResponse.data.grupos || []);
                setEvaluaciones(evaluacionesResponse.data || []);

                console.log(
                    "Datos de grupos cargados:",
                    gruposResponse.data.grupos
                );
                console.log(
                    "Datos de evaluaciones cargadas:",
                    evaluacionesResponse.data
                );
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };

        if (projectId) {
            fetchData();
        }
    }, [projectId]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const handleNuevaEvaluacionChange = (e) => {
        const { name, value } = e.target;
        setNuevaEvaluacion((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        if (name === "grupoEvaluado") {
            const grupoSeleccionado = grupos.find(
                (grupo) => String(grupo.ID_GRUPO) === value
            );

            if (grupoSeleccionado && grupoSeleccionado.fechas_defensa) {
                const defensa = grupoSeleccionado.fechas_defensa[0] || {};
                setFechaDefensa({
                    dia: defensa.day || "No asignado",
                    hora: `${defensa.HR_INIDEF || "00:00"} - ${
                        defensa.HR_FINDEF || "00:00"
                    }`,
                });
            } else {
                setFechaDefensa({ dia: "No asignado", hora: "No asignado" });
            }
        }
    };

    const handleCrearEvaluacion = async () => {
        if (
            !nuevaEvaluacion.grupoEvaluado ||
            !nuevaEvaluacion.fechaEvaluacion
        ) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8000/api/evaluaciones-pares`,
                {
                    grupoEvaluado: nuevaEvaluacion.grupoEvaluado,
                    fechaEvaluacion: nuevaEvaluacion.fechaEvaluacion,
                    projectId: projectId,
                },
                { withCredentials: true }
            );

            setEvaluaciones([...evaluaciones, response.data]);
            setShowModal(false);
            setNuevaEvaluacion({ grupoEvaluado: "", fechaEvaluacion: "" });
            setFechaDefensa({ dia: "", hora: "" });
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert(error.response.data.error);
            } else {
                console.error("Error al crear la evaluación:", error);
            }
        }
    };

    return (
        <div
            className={`evaluacion-pares-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderProyecto />
            <div className="evaluacion-pares-sidebar-content">
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                />
                <div className="container">
                    <div className="projects-header">
                        <h2>Evaluaciones de Pares</h2>
                        <button
                            className="new-project-btn"
                            onClick={() => setShowModal(true)}
                        >
                            <i className="fas fa-plus"></i> Nueva Evaluación
                        </button>
                    </div>

                    <div className="evaluaciones-list">
                        {Array.isArray(evaluaciones) &&
                        evaluaciones.length > 0 ? (
                            evaluaciones.map((evaluacion) => (
                                <div
                                    key={evaluacion.ID_EVALUACION}
                                    className="evaluacion-item"
                                >
                                    <h3>
                                        Grupo Evaluado: {evaluacion.grupoNombre}
                                    </h3>
                                    <p>
                                        <strong>Fecha de Evaluación:</strong>{" "}
                                        {evaluacion.fechaEvaluacion}
                                    </p>
                                    <button
                                        className="evaluar-btn"
                                        onClick={() =>
                                            navigate(
                                                `/evaluacion-pares/${projectId}/${evaluacion.ID_EVALUACION}`
                                            )
                                        }
                                    >
                                        Ver Evaluación
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No hay evaluaciones registradas</p>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="evaluacion-individual-modal-overlay">
                    <div className="evaluacion-individual-modal-content">
                        <h3 className="etapa-modal-title">
                            Nueva Evaluación de Pares
                        </h3>
                        <label className="etapa-label">Grupo:</label>
                        <select
                            name="grupoEvaluado"
                            value={nuevaEvaluacion.grupoEvaluado}
                            onChange={handleNuevaEvaluacionChange}
                        >
                            <option value="">Seleccione un Grupo</option>
                            {Array.isArray(grupos) &&
                                grupos.map((grupo) => (
                                    <option
                                        key={grupo.ID_GRUPO}
                                        value={String(grupo.ID_GRUPO)}
                                    >
                                        {grupo.NOMBRE_GRUPO}
                                    </option>
                                ))}
                        </select>

                        <div className="fecha-hora-container">
                            <div>
                                <label className="etapa-label">
                                    Día de Defensa:
                                </label>
                                <input
                                    type="text"
                                    placeholder="Día de Defensa"
                                    value={fechaDefensa.dia}
                                    readOnly
                                    className="fecha-hora-input"
                                />
                            </div>
                            <div>
                                <label className="etapa-label">
                                    Hora de Defensa:
                                </label>
                                <input
                                    type="text"
                                    placeholder="Hora de Defensa"
                                    value={fechaDefensa.hora}
                                    readOnly
                                    className="fecha-hora-input"
                                />
                            </div>
                        </div>

                        <label className="etapa-label">
                            Fecha de Evaluación:
                        </label>
                        <input
                            type="date"
                            name="fechaEvaluacion"
                            value={nuevaEvaluacion.fechaEvaluacion}
                            onChange={handleNuevaEvaluacionChange}
                        />

                        <div className="modal-actions">
                            <button
                                onClick={() => setShowModal(false)}
                                className="cancel-btn"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCrearEvaluacion}
                                className="create-btn"
                            >
                                Crear Evaluación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvaluacionDePares;
