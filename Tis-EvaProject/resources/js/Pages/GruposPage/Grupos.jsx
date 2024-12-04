import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import SidebarPrueba from "../../Components/ComponenteSidebar/SidebarPrueba";
import ModalConfirmacion from "../../Components/ComponenteModal/ModalConfirmacion";
import ModalMensajeExito from "../../Components/ComponenteModal/ModalMensajeExito";
import ModalError from "../../Components/ComponenteModal/ModalError"; // Importa el ModalError
import "../../../css/EstilosProyecto/Proyectos.css";
import "../../../css/EstilosGrupo/Grupos.css";
import "../../../css/EstilosHeader/HeaderProyecto.css";
import "../../../css/EstilosSidebar/SidebarPrueba.css";
import "../../../css/EstilosModal/ModalDefensa.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

const Grupos = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [groups, setGroups] = useState([]);
    const [projectDetails, setProjectDetails] = useState({});
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showDefenseModal, setShowDefenseModal] = useState(false);
    const [defenseDays, setDefenseDays] = useState([]);
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedStartTime, setSelectedStartTime] = useState("");
    const [selectedEndTime, setSelectedEndTime] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false); // Estado para controlar el modal de error
    const [errorMessage, setErrorMessage] = useState(""); // Mensaje de error
    const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal de confirmación
    const [showSuccessModal, setShowSuccessModal] = useState(false); // Modal de éxito
    const [successMessage, setSuccessMessage] = useState(""); // Mensaje de éxito
    const [deleteIndex, setDeleteIndex] = useState(null); // Índice de defensa a eliminar

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    const daysOrder = {
        Lunes: 1,
        Martes: 2,
        Miércoles: 3,
        Jueves: 4,
        Viernes: 5,
        Sábado: 6,
    };

    useEffect(() => {
        fetch(`http://localhost:8000/api/proyectos/${projectId}`)
            .then((response) => response.json())
            .then((data) => setProjectDetails(data))
            .catch((error) =>
                console.error("Error al cargar el proyecto:", error)
            );
    }, [projectId]);

    useEffect(() => {
        const obtenerGrupos = async () => {
            const response = await axios.get(
                `http://localhost:8000/api/proyectos/${projectId}/grupos-hora`,
                { withCredentials: true }
            );
            setGroups(response.data.grupos);
        };

        obtenerGrupos();
    }, [projectId]);

    useEffect(() => {
        const docenteId = localStorage.getItem("ID_DOCENTE");
        const role = localStorage.getItem("ROLE");
        if (!docenteId || role !== "Docente") navigate("/login");
    }, [navigate]);

    useEffect(() => {
        const obtenerFechasDefensaDocente = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/fechas_defensa/docente/${projectId}`,
                    { withCredentials: true }
                );
                setDefenseDays(sortDefenseDays(response.data));
            } catch (error) {
                console.error(
                    "Error al cargar las fechas de defensa para docente:",
                    error
                );
            }
        };

        obtenerFechasDefensaDocente();
    }, [projectId]);

    const openDefenseModal = () => {
        setShowDefenseModal(true);
        setIsEditMode(false);
        setSelectedDay("");
        setSelectedStartTime("");
        setSelectedEndTime("");
    };
    const openConfirmDeleteModal = (index) => {
        setDeleteIndex(index);
        setShowConfirmModal(true);
    };

    const handleAddDefenseDay = async () => {
        if (!selectedDay || !selectedStartTime || !selectedEndTime) {
            setErrorMessage("Todos los campos son obligatorios.");
            setShowErrorModal(true);
            return;
        }

        const newDefenseDay = {
            day: selectedDay,
            startTime: selectedStartTime,
            endTime: selectedEndTime,
            ID_PROYECTO: projectId,
        };

        console.log("Nuevo día de defensa a agregar o editar:", newDefenseDay);

        try {
            if (isEditMode && editIndex !== null) {
                // Lógica de edición
                await editDefenseDay(newDefenseDay);
            } else {
                // Lógica de creación
                await createDefenseDay(newDefenseDay);
            }

            // Cerrar el modal al finalizar
            setShowDefenseModal(false);
        } catch (error) {
            const errorMsg =
                error.response?.data?.error ||
                "No se pudo guardar la fecha de defensa.";
            console.error("Detalles del error:", error.response?.data);
            setErrorMessage(errorMsg);
            setShowErrorModal(true);
        }
    };

    // Método para crear un nuevo día de defensa
    const createDefenseDay = async (newDefenseDay) => {
        console.log("Agregando nuevo día de defensa.");
        const response = await axios.post(
            "http://localhost:8000/api/fechas_defensa",
            newDefenseDay,
            { withCredentials: true }
        );
        newDefenseDay.ID_FECHADEF = response.data.fechaDefensa.ID_FECHADEF;
        setDefenseDays(sortDefenseDays([...defenseDays, newDefenseDay]));
    };

    const formatTime = (time) => {
        // Asegurarse de que el tiempo esté en formato H:i eliminando segundos si están presentes
        const [hour, minute] = time.split(":");
        return `${parseInt(hour, 10)}:${minute}`;
    };

    const editDefenseDay = async (updatedDefenseDay) => {
        try {
            // Formatear startTime y endTime al formato H:i
            updatedDefenseDay.startTime = formatTime(
                updatedDefenseDay.startTime
            );
            updatedDefenseDay.endTime = formatTime(updatedDefenseDay.endTime);

            console.log(
                "Editando día de defensa:",
                defenseDays[editIndex].ID_FECHADEF
            );

            await axios.put(
                `http://localhost:8000/api/fechas_defensa/${defenseDays[editIndex].ID_FECHADEF}`,
                updatedDefenseDay,
                { withCredentials: true }
            );

            const updatedDefenseDays = defenseDays.map((day, i) =>
                i === editIndex
                    ? {
                          ...updatedDefenseDay,
                          ID_FECHADEF: defenseDays[editIndex].ID_FECHADEF,
                      }
                    : day
            );
            setDefenseDays(sortDefenseDays(updatedDefenseDays));
        } catch (error) {
            console.error("Detalles del error:", error.response?.data);
            setErrorMessage(
                error.response?.data?.error ||
                    "No se pudo actualizar la fecha de defensa."
            );
            setShowErrorModal(true);
        }
    };

    const handleDeleteDefenseDay = async () => {
        const fechaDefensa = defenseDays[deleteIndex];
        try {
            await axios.delete(
                `http://localhost:8000/api/fechas_defensa/${fechaDefensa.ID_FECHADEF}`,
                { withCredentials: true }
            );

            // Eliminar la fecha de defensa del estado y ordenar la lista
            const updatedDefenseDays = defenseDays.filter(
                (_, i) => i !== deleteIndex
            );
            setDefenseDays(sortDefenseDays(updatedDefenseDays));

            // Muestra el mensaje de éxito
            setSuccessMessage("Fecha de defensa eliminada con éxito.");
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error al eliminar la fecha de defensa:", error);
            setErrorMessage("No se pudo eliminar la fecha de defensa.");
            setShowErrorModal(true);
        } finally {
            // Cierra el modal de confirmación
            setShowConfirmModal(false);
        }
    };

    const handleOpenEditModal = (index) => {
        const defenseDay = defenseDays[index];
        setSelectedDay(defenseDay.day);
        setSelectedStartTime(defenseDay.HR_INIDEF);
        setSelectedEndTime(defenseDay.HR_FINDEF);
        setEditIndex(index);
        setIsEditMode(true);
        setShowDefenseModal(true);
    };

    const handleOpenConfirmModal = async (index) => {
        try {
            const fechaDefensa = defenseDays[index];
            await axios.delete(
                `http://localhost:8000/api/fechas_defensa/${fechaDefensa.ID_FECHADEF}`,
                { withCredentials: true }
            );

            // Elimina la fecha de defensa del estado
            const updatedDefenseDays = defenseDays.filter(
                (_, i) => i !== index
            );
            setDefenseDays(updatedDefenseDays);
        } catch (error) {
            console.error("Error al eliminar la fecha de defensa:", error);
            setErrorMessage("No se pudo eliminar la fecha de defensa.");
            setShowErrorModal(true);
        }
    };

    const sortDefenseDays = (days) => {
        return days.sort((a, b) => {
            // Comparar días usando el objeto daysOrder
            const dayComparison = daysOrder[a.day] - daysOrder[b.day];
            if (dayComparison !== 0) return dayComparison;

            // Comparar horas de inicio, asegurándonos de que startTime y endTime existen
            const startTimeA = a.startTime || a.HR_INIDEF || "";
            const startTimeB = b.startTime || b.HR_INIDEF || "";
            const startTimeComparison = startTimeA.localeCompare(startTimeB);
            if (startTimeComparison !== 0) return startTimeComparison;

            // Comparar horas de fin, asegurándonos de que endTime existe
            const endTimeA = a.endTime || a.HR_FINDEF || "";
            const endTimeB = b.endTime || b.HR_FINDEF || "";
            return endTimeA.localeCompare(endTimeB);
        });
    };

    return (
        <div
            className={`grupos-container ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderProyecto />
            <div className="grupos-sidebar-content">
                <SidebarPrueba
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={projectDetails?.NOMBRE_PROYECTO}
                    fotoProyecto={`http://localhost:8000/storage/${projectDetails?.PORTADA_PROYECTO}`}
                    projectId={projectId}
                />
                <div className="container">
                    <div className="projects-header">
                        <h2>Días de defensas</h2>
                        <button
                            className="new-project-btn"
                            onClick={openDefenseModal}
                        >
                            <i className="fas fa-plus"></i> Día de defensa
                        </button>
                    </div>
                    <div className="defense-days-list">
                        {Array.isArray(defenseDays) &&
                        defenseDays.length > 0 ? (
                            defenseDays.map((defense, index) => (
                                <div key={index} className="defense-day-item">
                                    <div className="defense-day-info">
                                        <h3 className="defense-day-title">
                                            {defense.day}
                                        </h3>
                                        <p className="defense-day-time">
                                            {defense.HR_INIDEF} -{" "}
                                            {defense.HR_FINDEF}
                                        </p>
                                    </div>
                                    <div className="defense-day-status">
                                        {defense.ID_GRUPO ? (
                                            <span className="reserved-text">
                                                Reservado por:{" "}
                                                {defense.NOMBRE_GRUPO}
                                            </span>
                                        ) : (
                                            <span className="available-text">
                                                Disponible
                                            </span>
                                        )}
                                    </div>
                                    <div className="projects-actions">
                                        <button
                                            className="actions-btn"
                                            onClick={() =>
                                                handleOpenEditModal(index)
                                            }
                                        >
                                            <i className="fas fa-pen"></i>
                                        </button>
                                        <button
                                            className="actions-btn"
                                            onClick={() =>
                                                openConfirmDeleteModal(index)
                                            }
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data-message">
                                No hay días de defensa registrados.
                            </p>
                        )}
                    </div>
                    <div className="projects-header">
                        <h2>Grupo Empresas</h2>
                    </div>
                    <div className="project-list">
                        {groups.length > 0 ? (
                            groups.map((group, index) => (
                                <div key={index} className="project-item">
                                    {group.PORTADA_GRUPO ? (
                                        <img
                                            src={`http://localhost:8000/storage/${group.PORTADA_GRUPO}`}
                                            alt="Icono del grupo"
                                            width="50"
                                            height="50"
                                        />
                                    ) : (
                                        <img
                                            src="https://via.placeholder.com/50"
                                            alt="Icono del grupo"
                                        />
                                    )}
                                    <div className="project-info">
                                        <h3
                                            onClick={() =>
                                                navigate(
                                                    `/proyectos/${projectId}/grupos/${group.ID_GRUPO}/estudiantes`
                                                )
                                            }
                                            style={{ cursor: "pointer" }}
                                        >
                                            {group.NOMBRE_GRUPO}
                                        </h3>
                                        <p>{group.DESCRIP_GRUPO}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data-message">
                                No hay grupos registrados.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {showDefenseModal && (
                <div className="defensa-modal-overlay">
                    <div className="defensa-modal-content">
                        <h2 className="defensa-modal-title">
                            {isEditMode
                                ? "Modificar día y hora de defensa"
                                : "Seleccionar día y hora de defensa"}
                        </h2>

                        <label className="defensa-modal-label">
                            Día:
                            <select
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(e.target.value)}
                                className="defensa-modal-select"
                            >
                                <option value="">Seleccione un día</option>
                                <option value="Lunes">Lunes</option>
                                <option value="Martes">Martes</option>
                                <option value="Miércoles">Miércoles</option>
                                <option value="Jueves">Jueves</option>
                                <option value="Viernes">Viernes</option>
                                <option value="Sábado">Sábado</option>
                            </select>
                        </label>

                        <div className="defensa-modal-time-container">
                            <label className="defensa-modal-label">
                                Hora de inicio:
                                <input
                                    type="time"
                                    value={selectedStartTime}
                                    onChange={(e) =>
                                        setSelectedStartTime(e.target.value)
                                    }
                                    className="defensa-modal-input"
                                />
                            </label>

                            <label className="defensa-modal-label">
                                Hora de fin:
                                <input
                                    type="time"
                                    value={selectedEndTime}
                                    onChange={(e) =>
                                        setSelectedEndTime(e.target.value)
                                    }
                                    className="defensa-modal-input"
                                />
                            </label>
                        </div>

                        <div className="modal-actions">
                            <button
                                onClick={() => setShowDefenseModal(false)}
                                className="cancel-btn"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={handleAddDefenseDay}
                                className="create-btn"
                            >
                                {isEditMode ? "Modificar" : "Agregar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de error */}
            {showErrorModal && (
                <ModalError
                    title="Error"
                    errorMessage={errorMessage}
                    closeModal={() => setShowErrorModal(false)}
                />
            )}
            {showConfirmModal && (
                <ModalConfirmacion
                    show={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={handleDeleteDefenseDay}
                    title="Confirmar eliminación"
                    message="¿Estás seguro de que deseas eliminar esta fecha de defensa?"
                />
            )}

            {showSuccessModal && (
                <ModalMensajeExito
                    message={successMessage}
                    onClose={() => setShowSuccessModal(false)}
                />
            )}
        </div>
    );
};

export default Grupos;
