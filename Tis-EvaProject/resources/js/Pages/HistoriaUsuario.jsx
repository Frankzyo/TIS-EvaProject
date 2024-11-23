import React, { useState, useEffect } from "react";
import { useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import SidebarEstudiante from "../Components/SidebarEstudiante";
import HeaderEstudiante from "../Components/HeaderEstudiante";
import SeleccionarUsuarioModal from "../Components/SeleccionarUsuarioModal";
import useProjectAndGroupId from "../Components/useProjectAndGroupId";
import axios from "axios";
import "react-quill/dist/quill.snow.css"; // Importar el CSS del tema
import "../../css/SidebarEstudiante.css"; // Importa el CSS del sidebar
import "../../css/PlanificacionEstudiante.css"; // Importa el CSS del header
import "../../css/HistoriaUsuario.css"; // Importa tu CSS específico

const HistoriaUsuario = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [proyecto, setProyecto] = useState(null);
    const [grupo, setGrupo] = useState(null);
    const [archivos, setArchivos] = useState([]); // Estado para almacenar los archivos subidos
    const { projectId, groupId } = useProjectAndGroupId();
    const [estudiantes, setEstudiantes] = useState([]);
    const [isRepresentanteLegal, setIsRepresentanteLegal] = useState(false);
    const fileInputRef = useRef(null); // Referencia al input de archivo
    const [historia, setHistoria] = useState({
        titulo: "",
        descripcion: "",
        adjuntos: [],
        tareas: [],
    });
    const [newTaskResponsable, setNewTaskResponsable] = useState("");
    const [newTaskFotoResponsable, setNewTaskFotoResponsable] = useState(null);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isNewTaskAssigning, setIsNewTaskAssigning] = useState(false);
    const [isEditingTitle, setEditingTitle] = useState(false); // Controla si estamos editando el título.
    const [newTitle, setNewTitle] = useState(historia.titulo); // Estado para el nuevo título.
    const [isEditingDescription, setEditingDescription] = useState(false); // Controla la edición de la descripción
    const [newDescription, setNewDescription] = useState(historia.descripcion); // Estado temporal para la descripción
    const [selectedImage, setSelectedImage] = useState(null); // Estado para la imagen seleccionada para zoom
    const [showTaskInput, setShowTaskInput] = useState(false); // Mostrar/Ocultar input de tarea
    const [newTask, setNewTask] = useState(""); // Estado para la nueva tarea
    const [tareas, setTareas] = useState(historia.tareas || []); // Estado para las tareas existentes
    const [editTaskIndex, setEditTaskIndex] = useState(null); // Índice de la tarea que se está editando
    const [editTaskText, setEditTaskText] = useState(""); // Texto de la tarea en edición
    const [editTaskStatus, setEditTaskStatus] = useState(""); // Estado de la tarea en edición
    const [taskStatus, setTaskStatus] = useState(""); // Estado para el dropdown de tareas
    const [isHovered, setIsHovered] = useState(false); // Controla cuando el mouse está sobre el input
    const [hoveredTaskIndex, setHoveredTaskIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para abrir/cerrar el modal
    const [selectedTaskIndex, setSelectedTaskIndex] = useState(null); // Estado para la tarea que se está editando en el modal
    const openModal = (index) => {
        setSelectedTaskIndex(index);
        setIsModalOpen(true);
    };
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };
    // Función para manejar el usuario seleccionado
    const handleSelectUser = async (user) => {
        if (isNewTaskAssigning) {
            // Asignar usuario a la nueva tarea
            setNewTaskResponsable(`${user.NOMBRE_EST} ${user.APELLIDO_EST}`);
            setNewTaskFotoResponsable(user.FOTO_EST); // Asignar foto del responsable
            setIsNewTaskAssigning(false); // Desactivar estado de asignación
        } else if (selectedTaskIndex !== null) {
            // Asignar usuario a una tarea existente
            const updatedTasks = [...tareas];
            const selectedTask = updatedTasks[selectedTaskIndex];

            selectedTask.RESPONSABLE_TAREAHU = `${user.NOMBRE_EST} ${user.APELLIDO_EST}`;
            selectedTask.FOTO_RESPONSABLE = user.FOTO_EST;

            setTareas(updatedTasks);
            await assignResponsableToTask(
                selectedTask.ID_TAREAHU,
                selectedTask.RESPONSABLE_TAREAHU,
                selectedTask.FOTO_RESPONSABLE
            );
        }

        toggleModal(); // Cierra el modal después de la selección
    };

    const assignResponsableToTask = async (
        taskId,
        responsable,
        fotoResponsable
    ) => {
        try {
            const response = await axios.put(
                `http://localhost:8000/api/tareas/${taskId}/responsable`,
                {
                    RESPONSABLE_TAREAHU: responsable,
                    FOTO_RESPONSABLE: fotoResponsable,
                }
            );
            console.log("Responsable asignado correctamente:", response.data);
        } catch (error) {
            console.error("Error al asignar el responsable:", error);
        }
    };

    useEffect(() => {
        const role = localStorage.getItem("ROLE");
        const estudianteId = localStorage.getItem("ID_EST");
        const representanteLegal = localStorage.getItem("IS_RL");

        if (role !== "Estudiante" || !estudianteId) {
            navigate("/login");
        }

        setIsRepresentanteLegal(representanteLegal === "true");
    }, [navigate]);
    useEffect(() => {
        const obtenerDatosEstudiante = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8000/estudiante/proyecto-grupo",
                    { withCredentials: true }
                );
                console.log("Datos del estudiante:", response.data);

                if (response.data) {
                    setProyecto(response.data.proyecto);
                    setGrupo(response.data.grupo);
                    setEstudiantes(response.data.grupo.estudiantes || []);
                }
            } catch (error) {
                console.error(
                    "Error al cargar los datos del estudiante:",
                    error
                );
            }
        };
        const obtenerHistoria = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/historias-datos/${id}`,
                    {
                        withCredentials: true,
                    }
                );
                const data = response.data;

                setHistoria(data);
                setNewTitle(data.TITULO_HU); // Inicializa el título para mostrarlo inmediatamente
                setNewDescription(data.DESCRIP_HU); // Inicializa la descripción

                // Mapear el arreglo de nombres de imágenes para incluir la URL completa
                setArchivos(
                    (data.IMAGEN_HU || []).map(
                        (img) =>
                            `http://localhost:8000/storage/imagenes_historias/${img}`
                    )
                );

                const tareasResponse = await axios.get(
                    `http://localhost:8000/api/historias/${id}/tareas`,
                    { withCredentials: true }
                );
                setTareas(tareasResponse.data || []);
            } catch (error) {
                console.error(
                    "Error al obtener la historia de usuario:",
                    error
                );
            }
        };

        obtenerHistoria();
        obtenerDatosEstudiante();
    }, [id]);
    useEffect(() => {
        const obtenerEstudiantesDelGrupo = async () => {
            if (!groupId) {
                console.error("groupId no está definido");
                return;
            }

            try {
                const response = await axios.get(
                    `http://localhost:8000/api/estudiantes/grupo/${groupId}`
                );
                console.log("Estudiantes del grupo:", response.data);
                setEstudiantes(response.data);
            } catch (error) {
                console.error("Error al obtener estudiantes del grupo:", error);
            }
        };

        if (groupId) {
            obtenerEstudiantesDelGrupo();
        }
    }, [groupId]);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    // 4. Al hacer clic en el título, permitimos la edición.
    const handleTitleClick = () => {
        setEditingTitle(true); // Activar el modo de edición del título.
    };
    const handleSaveDescription = async () => {
        try {
            await axios.put(
                `http://localhost:8000/api/historias/${id}/descripcion`,
                { descripcion: newDescription },
                { withCredentials: true }
            );

            // Actualizar el estado después de guardar exitosamente
            setEditingDescription(false);
            setHistoria((prevHistoria) => ({
                ...prevHistoria,
                descripcion: newDescription,
            }));
        } catch (error) {
            console.error(
                "Error al actualizar la descripción en el backend:",
                error
            );
        }
    };
    const handleDescriptionChange = (value) => {
        setNewDescription(value);
    };

    const handleImageClick = (imageSrc) => {
        setSelectedImage(imageSrc); // Seleccionar la imagen a hacer zoom
    };

    const closeModal = () => {
        setSelectedImage(null); // Cerrar el modal cuando se hace clic fuera de la imagen
        setIsModalOpen(false);
        setSelectedTaskIndex(null);
    };

    <ReactQuill
        theme="snow"
        value={newDescription}
        onChange={setNewDescription}
    />;

    const handleDescriptionBlur = (e) => {
        setTimeout(() => {
            if (!document.activeElement.classList.contains("ql-editor")) {
                setEditingDescription(false); // Desactiva la edición solo si no está en el editor
            }
        }, 200); // Retrasar un poco para manejar bien el foco
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(
            (file) =>
                file.type === "image/jpeg" ||
                file.type === "image/jpg" ||
                file.type === "image/png"
        );

        if (validFiles.length !== files.length) {
            alert("Solo se permiten imágenes en formato JPEG, JPG o PNG");
            return;
        }

        const formData = new FormData();
        validFiles.forEach((file) => formData.append("imagen", file));

        try {
            const response = await axios.post(
                `http://localhost:8000/api/historias/${id}/subir-imagen`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );

            // Agregar las nuevas imágenes al estado de archivos
            const nuevasImagenes = response.data.imagenes || [];
            setArchivos((prevArchivos) => [
                ...prevArchivos,
                ...nuevasImagenes.map(
                    (img) =>
                        `http://localhost:8000/storage/imagenes_historias/${img}`
                ),
            ]);
        } catch (error) {
            console.error("Error al subir las imágenes:", error);
        }
    };

    // Manejar los archivos arrastrados y soltados
    const handleDrop = async (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const validFiles = files.filter(
            (file) =>
                file.type === "image/jpeg" ||
                file.type === "image/jpg" ||
                file.type === "image/png"
        );

        if (validFiles.length !== files.length) {
            alert("Solo se permiten imágenes en formato JPEG, JPG o PNG");
            return;
        }

        const formData = new FormData();
        validFiles.forEach((file) => formData.append("imagen", file));

        try {
            const response = await axios.post(
                `http://localhost:8000/api/historias/${id}/subir-imagen`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );

            // Agregar las nuevas imágenes al estado de archivos
            const nuevasImagenes = response.data.imagenes || [];
            setArchivos((prevArchivos) => [
                ...prevArchivos,
                ...nuevasImagenes.map(
                    (img) =>
                        `http://localhost:8000/storage/imagenes_historias/${img}`
                ),
            ]);
        } catch (error) {
            console.error("Error al subir las imágenes:", error);
        }
    };

    // Eliminar archivo de la lista
    const eliminarArchivo = async (index) => {
        const fileToDelete = archivos[index];
        const fileName = fileToDelete.split("/").pop();

        try {
            await axios.delete(
                `http://localhost:8000/api/imagen-historia/${fileName}`,
                {
                    withCredentials: true,
                }
            );

            // Remover el archivo del estado del frontend
            setArchivos((prevArchivos) =>
                prevArchivos.filter((_, i) => i !== index)
            );
        } catch (error) {
            console.error("Error al eliminar la imagen en el backend:", error);
        }
    };

    const handleAddTaskClick = () => {
        setShowTaskInput(!showTaskInput); // Cambiar el estado para mostrar o esconder el input
    };

    const handleTaskChange = (e) => {
        setNewTask(e.target.value); // Actualizar el estado con el valor del input
    };

    const handleSaveTask = async () => {
        if (newTask.trim() !== "") {
            try {
                const response = await axios.post(
                    `http://localhost:8000/api/historias/${id}/tareas`,
                    {
                        TITULO_TAREAHU: newTask,
                        ESTADO_TAREAHU: taskStatus,
                        RESPONSABLE_TAREAHU:
                            newTaskResponsable || "Sin asignar",
                        FOTO_RESPONSABLE: newTaskFotoResponsable,
                    },
                    { withCredentials: true }
                );

                // Actualizar el estado de las tareas con la nueva tarea agregada desde el backend
                setTareas((prevTareas) => [...prevTareas, response.data.tarea]);

                // Limpiar el input y resetear el estado
                setNewTask("");
                setNewTaskResponsable(""); // Restablece el responsable de la nueva tarea
                setNewTaskFotoResponsable(null); // Restablece la foto del responsable de la nueva tarea
                setTaskStatus("new");
                setShowTaskInput(false);
            } catch (error) {
                console.error("Error al agregar la tarea:", error);
            }
        }
    };

    const eliminarTarea = async (idTarea, index) => {
        try {
            await axios.delete(`http://localhost:8000/api/tareas/${idTarea}`, {
                withCredentials: true,
            });

            // Eliminar la tarea del estado del frontend
            setTareas((prevTareas) => prevTareas.filter((_, i) => i !== index));
        } catch (error) {
            console.error("Error al eliminar la tarea en el backend:", error);
        }
    };

    const editarTarea = (index) => {
        setEditTaskIndex(index);
        setEditTaskText(tareas[index].TITULO_TAREAHU || ""); // Asegúrate de que tenga un valor inicial
        setEditTaskStatus(tareas[index].ESTADO_TAREAHU || "new"); // Si no tiene estado, asigna uno por defecto
    };
    // Función para guardar los cambios de una tarea editada
    const guardarEdicion = async (index) => {
        const tareaEditada = tareas[index];

        // Verificar los valores antes de enviar la solicitud
        console.log("Guardando edición para tarea:", tareaEditada);
        console.log("Título editado:", editTaskText);
        console.log("Estado editado:", editTaskStatus);

        try {
            const response = await axios.put(
                `http://localhost:8000/api/tareas/${tareaEditada.ID_TAREAHU}`,
                {
                    TITULO_TAREAHU: editTaskText,
                    ESTADO_TAREAHU: editTaskStatus,
                    RESPONSABLE_TAREAHU:
                        tareaEditada.RESPONSABLE_TAREAHU || "Sin asignar",
                },
                { withCredentials: true }
            );

            // Actualizar el estado de las tareas en el frontend
            const tareasActualizadas = [...tareas];
            tareasActualizadas[index] = response.data.tarea;
            setTareas(tareasActualizadas);

            // Restablecer los estados de edición
            setEditTaskIndex(null);
            setEditTaskText("");
            setEditTaskStatus("");
        } catch (error) {
            console.error("Error al guardar la edición de la tarea:", error);
        }
    };

    const handleStatusChange = (e) => {
        setTaskStatus(e.target.value); // Actualiza el valor del estado de la tarea
    };

    const handleSaveTitle = async () => {
        try {
            await axios.put(
                `http://localhost:8000/api/historias/${id}/titulo`,
                { titulo: newTitle },
                { withCredentials: true }
            );

            // Actualizar el estado después de guardar exitosamente
            setEditingTitle(false);
            setHistoria((prevHistoria) => ({
                ...prevHistoria,
                titulo: newTitle,
            }));
        } catch (error) {
            console.error(
                "Error al actualizar el título en el backend:",
                error
            );
        }
    };

    return (
        <div
            className={`historia-usuario planificacion-pagina ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <HeaderEstudiante />
            <div className="contenido-con-sidebar">
                <SidebarEstudiante
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={proyecto?.NOMBRE_PROYECTO} // Campo del nombre del proyecto
                    fotoProyecto={`http://localhost:8000/storage/${proyecto?.PORTADA_PROYECTO}`} // Ruta completa de la imagen
                    projectId={projectId}
                    groupId={groupId}
                    isRepresentanteLegal={isRepresentanteLegal}
                />
                {/* Contenido principal */}
                <div className="contenido-scrollable">
                    <div className="historia-usuario-contenido">
                        <div className="hu-container">
                            <div className="hu-header">
                                <div className="hu-header-text">
                                    {isEditingTitle ? (
                                        <div className="input-with-icons">
                                            <input
                                                type="text"
                                                value={newTitle}
                                                onChange={(e) =>
                                                    setNewTitle(e.target.value)
                                                }
                                                autoFocus
                                                className="editing-title"
                                            />
                                            <div className="icons-container">
                                                <i
                                                    className="fas fa-save icono-guardar"
                                                    onClick={handleSaveTitle}
                                                ></i>
                                                <i
                                                    className="fas fa-times icono-cancelar"
                                                    onClick={() => {
                                                        setEditingTitle(false);
                                                        setNewTitle(
                                                            historia.titulo
                                                        );
                                                    }}
                                                ></i>
                                            </div>
                                        </div>
                                    ) : (
                                        <h1
                                            className="hu-titulo"
                                            onClick={handleTitleClick}
                                        >
                                            <span className="numero-historia">
                                                #{location.state?.numero || 1}
                                            </span>{" "}
                                            {newTitle ||
                                                "Haz clic para añadir un título"}
                                        </h1>
                                    )}
                                    <p className="hu-subtitulo">
                                        HISTORIA DE USUARIO
                                    </p>
                                </div>
                            </div>

                            <div className="hu-section hu-contenido-unido">
                                {/* Sección de Descripción */}
                                <div className="hu-section hu-description">
                                    <h3>Descripción</h3>
                                    {isEditingDescription ? (
                                        <div>
                                            <ReactQuill
                                                theme="snow"
                                                value={newDescription}
                                                onChange={
                                                    handleDescriptionChange
                                                }
                                                onBlur={handleDescriptionBlur} // Detecta cuando el foco se pierde
                                            />

                                            {/* Botones de Guardar y Cancelar */}
                                            <div className="edit-buttons">
                                                <button
                                                    className="btn btn-save"
                                                    onClick={
                                                        handleSaveDescription
                                                    }
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    className="btn btn-cancel"
                                                    onClick={() => {
                                                        setEditingDescription(
                                                            false
                                                        );
                                                        setNewDescription(
                                                            historia.descripcion
                                                        );
                                                    }}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() =>
                                                setEditingDescription(true)
                                            } // Entra en modo edición al hacer clic
                                            dangerouslySetInnerHTML={{
                                                __html: newDescription,
                                            }}
                                        ></div>
                                    )}
                                </div>
                            </div>

                            <div className="hu-section hu-adjuntos">
                                <div className="adjuntos-info">
                                    <h3>
                                        {archivos.length > 0
                                            ? `${archivos.length} adjuntos`
                                            : "Adjuntos"}
                                    </h3>
                                    <button
                                        className="boton-adjuntar"
                                        onClick={() =>
                                            fileInputRef.current.click()
                                        }
                                    >
                                        <i className="fas fa-plus"></i>
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: "none" }}
                                        onChange={handleFileUpload}
                                        multiple
                                        accept="image/jpeg, image/jpg, image/png"
                                    />
                                </div>

                                <div
                                    className={`drag-drop-zone-historia ${
                                        archivos.length > 0 ? "with-files" : ""
                                    }`}
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    {archivos.length === 0 && (
                                        <p className="drag-drop-text">
                                            ¡Arrastre los archivos adjuntos
                                            aquí!
                                        </p>
                                    )}

                                    <div className="preview-container">
                                        {archivos
                                            .filter((file) => file !== null) // Filtrar valores nulos o indefinidos
                                            .map((file, index) => (
                                                <div
                                                    key={`preview-${index}`} // Usar un key más descriptivo
                                                    className="preview-item"
                                                >
                                                    <img
                                                        src={file} // Usa `file` directamente como src
                                                        alt={`preview-${index}`}
                                                        className="adjunto-imagen"
                                                        onClick={() =>
                                                            handleImageClick(
                                                                file
                                                            )
                                                        }
                                                    />
                                                    <button
                                                        className="boton-eliminar"
                                                        onClick={() =>
                                                            eliminarArchivo(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {/* Modal para zoom de imagen */}
                                {selectedImage && (
                                    <div
                                        className="image-modal"
                                        onClick={closeModal}
                                    >
                                        <div
                                            className="image-modal-content"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <img
                                                src={selectedImage}
                                                alt="Imagen grande"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="hu-section hu-tareas">
                                <div className="adjuntos-info">
                                    <h3>Tareas</h3>
                                    <button
                                        className="boton-adjuntar" // Vuelve el botón de agregar tarea azul
                                        onClick={handleAddTaskClick}
                                    >
                                        <i
                                            className={`fas fa-${
                                                showTaskInput ? "minus" : "plus"
                                            }`}
                                        ></i>
                                    </button>
                                </div>

                                {/* Lista de tareas */}
                                <ul className="tareas-lista">
                                    {tareas.length > 0 &&
                                        tareas.map((tarea, index) => (
                                            <li
                                                key={tarea.ID_TAREAHU}
                                                className="tarea-item"
                                                onMouseEnter={() => {
                                                    setHoveredTaskIndex(index);
                                                    setIsHovered(true);
                                                }}
                                                onMouseLeave={() => {
                                                    setHoveredTaskIndex(null);
                                                    setIsHovered(false);
                                                }}
                                            >
                                                <div className="tarea-contenido">
                                                    {/* Mostrar número secuencial y título de la tarea */}
                                                    {editTaskIndex === index ? (
                                                        <input
                                                            type="text"
                                                            value={
                                                                editTaskText ||
                                                                tareas[index]
                                                                    .TITULO_TAREAHU
                                                            } // Valor condicional
                                                            onChange={(e) =>
                                                                setEditTaskText(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="task-edit-input"
                                                        />
                                                    ) : (
                                                        <span className="tarea-texto">
                                                            <span className="numero-tarea">
                                                                <span>#</span>
                                                                {index + 1}
                                                            </span>
                                                            {
                                                                tarea.TITULO_TAREAHU
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="tarea-acciones">
                                                    {hoveredTaskIndex ===
                                                        index && (
                                                        <>
                                                            {editTaskIndex ===
                                                            index ? (
                                                                <i
                                                                    className="fas fa-save iconos-guardar"
                                                                    onClick={() =>
                                                                        guardarEdicion(
                                                                            index
                                                                        )
                                                                    }
                                                                ></i>
                                                            ) : (
                                                                <i
                                                                    className="fas fa-edit iconos-editar"
                                                                    onClick={() =>
                                                                        editarTarea(
                                                                            index
                                                                        )
                                                                    }
                                                                ></i>
                                                            )}
                                                            <i
                                                                className="fas fa-trash-alt iconos-eliminar"
                                                                onClick={() =>
                                                                    eliminarTarea(
                                                                        tarea.ID_TAREAHU,
                                                                        index
                                                                    )
                                                                }
                                                            ></i>
                                                        </>
                                                    )}

                                                    {/* Estado de la tarea */}
                                                    {editTaskIndex === index ? (
                                                        <select
                                                            value={
                                                                editTaskStatus
                                                            }
                                                            onChange={(e) =>
                                                                setEditTaskStatus(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="task-status-dropdown"
                                                        >
                                                            <option value="new">
                                                                New
                                                            </option>
                                                            <option value="in-progress">
                                                                In Progress
                                                            </option>
                                                            <option value="ready-for-test">
                                                                Ready for Test
                                                            </option>
                                                            <option value="closed">
                                                                Closed
                                                            </option>
                                                            <option value="needs-info">
                                                                Needs Info
                                                            </option>
                                                        </select>
                                                    ) : (
                                                        <span className="tarea-estado">
                                                            {
                                                                tarea.ESTADO_TAREAHU
                                                            }
                                                        </span>
                                                    )}

                                                    {/* Imagen del avatar */}
                                                    <img
                                                        src={`http://localhost:8000/storage/${tarea.FOTO_RESPONSABLE}`}
                                                        alt="Foto del responsable"
                                                        className="tarea-perfil-imagen"
                                                    />

                                                    {/* Texto de asignación */}
                                                    <span className="tarea-asignado">
                                                        {tarea.RESPONSABLE_TAREAHU ||
                                                            "Not assigned"}
                                                    </span>

                                                    {/* Mostrar ícono de flecha solo cuando el mouse está sobre el input */}
                                                    {hoveredTaskIndex ===
                                                        index && (
                                                        <i
                                                            className="fas fa-chevron-down task-assigned-icon"
                                                            onClick={() =>
                                                                openModal(index)
                                                            }
                                                        ></i>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                                <SeleccionarUsuarioModal
                                    isOpen={isModalOpen}
                                    onClose={toggleModal}
                                    estudiantes={estudiantes}
                                    onSelectUser={handleSelectUser}
                                />
                                {/* Muestra el input para agregar tareas solo si showTaskInput es true */}
                                {showTaskInput && (
                                    <div
                                        className="task-input-container"
                                        onMouseEnter={() => setIsHovered(true)} // Mostrar ícono y efectos cuando pase el mouse
                                        onMouseLeave={() => setIsHovered(false)} // Ocultar cuando el mouse se va
                                    >
                                        <input
                                            type="text"
                                            placeholder="Escribe una nueva tarea"
                                            value={newTask}
                                            onChange={handleTaskChange}
                                            className="task-input-field"
                                        />
                                        {/* Ícono de guardar tarea */}
                                        {isHovered && ( // Mostrar solo si el mouse está sobre el input
                                            <i
                                                className="fas fa-save save-task-icon"
                                                onClick={handleSaveTask}
                                            ></i>
                                        )}

                                        {/* Dropdown para seleccionar el estado de la tarea */}
                                        <select
                                            className="task-status-dropdown"
                                            value={taskStatus}
                                            onChange={handleStatusChange}
                                        >
                                            <option value="new">New</option>
                                            <option value="in-progress">
                                                In Progress
                                            </option>
                                            <option value="ready-for-test">
                                                Ready for Test
                                            </option>
                                            <option value="closed">
                                                Closed
                                            </option>
                                            <option value="needs-info">
                                                Needs Info
                                            </option>
                                        </select>

                                        {/* Imagen de avatar para asignar */}
                                        <div className="task-assigned-container">
                                            <img
                                                src={
                                                    newTaskFotoResponsable
                                                        ? `http://localhost:8000/storage/${newTaskFotoResponsable}`
                                                        : "https://via.placeholder.com/40"
                                                }
                                                alt="Assigned"
                                                className="task-assigned-avatar"
                                            />
                                            {/* Texto "Not assigned" */}
                                            <span className="task-assigned-text">
                                                {newTaskResponsable ||
                                                    "Not assigned"}
                                            </span>
                                            {/* Ícono de flecha que solo aparece al hacer hover */}
                                            {isHovered && (
                                                <i
                                                    className="fas fa-chevron-down task-assigned-icon"
                                                    onClick={() => {
                                                        setIsNewTaskAssigning(
                                                            true
                                                        ); // Activa el estado de asignación para nueva tarea
                                                        setIsModalOpen(true); // Abre el modal
                                                    }}
                                                ></i>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoriaUsuario;
