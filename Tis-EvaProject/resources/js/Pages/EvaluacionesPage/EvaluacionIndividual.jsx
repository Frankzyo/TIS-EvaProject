import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import SidebarPrueba from "../../Components/ComponenteSidebar/SidebarPrueba";
import "../../../css/EstilosHeader/HeaderProyecto.css";
import "../../../css/EstilosSidebar/SidebarPrueba.css";
import "../../../css/EstilosEvaluaciones/EvaluacionIndividual.css";
import axios from "axios";

const EvaluacionIndividual = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [examenes, setExamenes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [nuevoExamen, setNuevoExamen] = useState({
        grupoId: "",
        etapaId: "",
    });
    const [grupos, setGrupos] = useState([]);
    const [etapas, setEtapas] = useState([]);
    const [fechaDefensa, setFechaDefensa] = useState({ dia: "", hora: "" });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectResponse, gruposResponse, examenesResponse] =
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
                            `http://localhost:8000/api/evaluaciones-individuales/proyecto/${projectId}`,
                            { withCredentials: true }
                        ),
                    ]);

                setProjectDetails(projectResponse.data);
                setGrupos(gruposResponse.data.grupos || []);
                setEtapas(gruposResponse.data.etapas || []);
                setExamenes(examenesResponse.data || []);

                console.log(
                    "Datos de grupos cargados:",
                    gruposResponse.data.grupos
                );
                console.log(
                    "Datos de etapas cargadas:",
                    gruposResponse.data.etapas
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

    const handleNuevoExamenChange = (e) => {
        const { name, value } = e.target;
        setNuevoExamen((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        if (name === "grupoId") {
            const selectedGrupo = grupos.find(
                (grupo) => String(grupo.ID_GRUPO) === value
            );

            console.log("Grupo seleccionado:", selectedGrupo);

            if (
                selectedGrupo &&
                selectedGrupo.fechas_defensa &&
                selectedGrupo.fechas_defensa.length > 0
            ) {
                const fechaDefensaData = selectedGrupo.fechas_defensa[0];
                const { day, HR_INIDEF, HR_FINDEF } = fechaDefensaData;

                console.log("Fecha de defensa encontrada:", fechaDefensaData);

                setFechaDefensa({
                    dia: day || "Sin día",
                    hora: `${HR_INIDEF || "00:00"} - ${HR_FINDEF || "00:00"}`,
                });
            } else {
                console.log(
                    "No se encontró fecha de defensa para el grupo seleccionado."
                );
                setFechaDefensa({ dia: "", hora: "" });
            }
        }

        if (name === "etapaId") {
            const selectedEtapa = etapas.find(
                (etapa) => String(etapa.ID_ETAPA) === value
            );

            console.log("Etapa seleccionada:", selectedEtapa);

            if (selectedEtapa) {
                console.log(
                    "Detalles de la etapa seleccionada:",
                    selectedEtapa
                );
            } else {
                console.log("No se encontró etapa para el ID seleccionado.");
            }
        }
    };

    const handleCrearExamen = async () => {
        if (!nuevoExamen.grupoId || !nuevoExamen.etapaId) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8000/api/evaluaciones-individuales`,
                {
                    grupoId: nuevoExamen.grupoId,
                    etapaId: nuevoExamen.etapaId,
                    projectId: projectId,
                },
                { withCredentials: true }
            );

            setExamenes([...examenes, response.data]);
            setShowModal(false);
            setNuevoExamen({ grupoId: "", etapaId: "" });
            setFechaDefensa({ dia: "", hora: "" });
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert(error.response.data.error); // Mostrar el mensaje de error
            } else {
                console.error("Error al crear el examen:", error);
            }
        }
    };
    // Agrupar exámenes por etapa
    const examenesPorEtapa = examenes.reduce((acc, examen) => {
        const { etapaNombre } = examen;
        if (!acc[etapaNombre]) {
            acc[etapaNombre] = [];
        }
        acc[etapaNombre].push(examen);
        return acc;
    }, {});

    return (
        <div
            className={`evaluacion-individual-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderProyecto />
            <div className="evaluacion-individual-sidebar-content">
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                />
                <div className="container">
                    <div className="projects-header">
                        <h2>Evaluaciones Individuales</h2>
                        <button
                            className="new-project-btn"
                            onClick={() => setShowModal(true)}
                        >
                            <i className="fas fa-plus"></i> Nueva Evaluación
                        </button>
                    </div>

                    {examenes.length > 0 ? (
                        Object.keys(examenesPorEtapa).map((etapa) => (
                            <div key={etapa} className="etapasd-container">
                                <div className="etapas-header">
                                    <h3 className="etapas-titulo">{etapa}</h3>
                                    <hr className="etapas-divider" />
                                </div>
                                <div className="examenes-list">
                                    {examenesPorEtapa[etapa].map((examen) => (
                                        <div
                                            key={examen.ID_EVALUACION}
                                            className="examen-item"
                                        >
                                            <div className="examen-item-content">
                                                <div className="grupo-info">
                                                    <img
                                                        src={examen.grupoFoto}
                                                        alt={`Foto de ${examen.grupoNombre}`}
                                                        className="grupo-foto"
                                                    />
                                                    <p className="examen-grupo">
                                                        <strong>Grupo:</strong>{" "}
                                                        {examen.grupoNombre}
                                                    </p>
                                                </div>

                                                <div className="defensa-info">
                                                    <p>
                                                        <strong>Día:</strong>{" "}
                                                        {examen.defensaDia ||
                                                            "No asignado"}
                                                    </p>
                                                    <p>
                                                        <strong>Hora:</strong>{" "}
                                                        {examen.defensaHora ||
                                                            "No asignado"}
                                                    </p>
                                                </div>

                                                {examen.representanteLegal && (
                                                    <div className="representante-info">
                                                        <img
                                                            src={
                                                                examen
                                                                    .representanteLegal
                                                                    .foto
                                                            }
                                                            alt={`${examen.representanteLegal.nombre} ${examen.representanteLegal.apellido}`}
                                                            className="representante-foto"
                                                        />
                                                        <p>
                                                            <strong>
                                                                Representante:
                                                            </strong>{" "}
                                                            {
                                                                examen
                                                                    .representanteLegal
                                                                    .nombre
                                                            }{" "}
                                                            {
                                                                examen
                                                                    .representanteLegal
                                                                    .apellido
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                                <button
                                                    className="evaluar-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/evaluacion-individual/${projectId}/${examen.ID_EVALUACION}`
                                                        )
                                                    }
                                                >
                                                    Evaluar Grupo
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-data-message">
                            No hay evaluaciones individuales registradas.
                        </p>
                    )}

                    {grupos.length === 0 && (
                        <p className="no-data-message">
                            No hay grupos registrados.
                        </p>
                    )}

                    {etapas.length === 0 && (
                        <p className="no-data-message">
                            No hay etapas registradas.
                        </p>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="evaluacion-individual-modal-overlay">
                    <div className="evaluacion-individual-modal-content">
                        <h3 className="etapa-modal-title">
                            Crear Nueva Evaluación
                        </h3>
                        {/* Campo de selección de grupo */}
                        <label className="etapa-label">Grupo:</label>
                        <select
                            name="grupoId"
                            value={nuevoExamen.grupoId}
                            onChange={handleNuevoExamenChange}
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

                        {/* Campo de selección de fecha y hora de defensa */}
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

                        {/* Campo de selección de etapa */}
                        <label className="etapa-label">Etapa:</label>
                        <select
                            name="etapaId"
                            value={nuevoExamen.etapaId}
                            onChange={handleNuevoExamenChange}
                        >
                            <option value="">Seleccione una Etapa</option>
                            {Array.isArray(etapas) &&
                                etapas.map((etapa) => (
                                    <option
                                        key={etapa.ID_ETAPA}
                                        value={String(etapa.ID_ETAPA)}
                                    >
                                        {etapa.ETAPAS_TITULO}
                                    </option>
                                ))}
                        </select>
                        <div className="modal-actions">
                            <button
                                onClick={() => setShowModal(false)}
                                className="cancel-btn"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCrearExamen}
                                className="create-btn"
                            >
                                Crear Examen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EvaluacionIndividual;
