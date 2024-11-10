import React, { useState, useEffect } from "react";
import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill';
import SidebarEstudiante from "../Components/SidebarEstudiante";
import Header from "../Components/HeaderEstudiante";
import axios from "axios";
import "react-quill/dist/quill.snow.css"; // Importar el CSS del tema
import "../../css/SidebarEstudiante.css"; // Importa el CSS del sidebar
import "../../css/PlanificacionEstudiante.css"; // Importa el CSS del header
import "../../css/HistoriaUsuario.css"; // Importa tu CSS específico

const HistoriaUsuario = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [proyecto, setProyecto] = useState(null);
    const [grupo, setGrupo] = useState(null);
    const historiaRecibida = location.state?.historia || {
        titulo: "",
        descripcion: "",
        adjuntos: [],
    };
    const [archivos, setArchivos] = useState([]); // Estado para almacenar los archivos subidos
    const fileInputRef = useRef(null); // Referencia al input de archivo
    const [historia, setHistoria] = useState(historiaRecibida);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    const [showSaveIcon, setShowSaveIcon] = useState(false);
    const [isHovered, setIsHovered] = useState(false); // Controla cuando el mouse está sobre el input
    const [hoveredTaskIndex, setHoveredTaskIndex] = useState(null);

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
                }
            } catch (error) {
                console.error(
                    "Error al cargar los datos del estudiante:",
                    error
                );
            }
        };

        obtenerDatosEstudiante();
    }, []);

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);

    // 4. Al hacer clic en el título, permitimos la edición.
    const handleTitleClick = () => {
        setEditingTitle(true); // Activar el modo de edición del título.
    };
    const handleDescriptionChange = (value) => {
        setNewDescription(value);
    };

    const handleImageClick = (imageSrc) => {
        setSelectedImage(imageSrc); // Seleccionar la imagen a hacer zoom
    };

    const closeModal = () => {
        setSelectedImage(null); // Cerrar el modal cuando se hace clic fuera de la imagen
    };

    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "c") {
            document.execCommand("copy");
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "v") {
            document.execCommand("paste");
        }
    };

    <ReactQuill
        theme="snow"
        value={newDescription}
        onChange={setNewDescription}
        onBlur={() => {
            setEditingDescription(false);
            setHistoria((prevHistoria) => ({
                ...prevHistoria,
                descripcion: newDescription,
            }));
        }}
        onKeyDown={handleKeyDown}
        clipboard={{
            matchVisual: false,
        }}
    />;

    const handleDescriptionBlur = (e) => {
        setTimeout(() => {
            if (!document.activeElement.classList.contains("ql-editor")) {
                setEditingDescription(false); // Desactiva la edición solo si no está en el editor
            }
        }, 200); // Retrasar un poco para manejar bien el foco
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(
            (file) =>
                file.type === "image/jpeg" ||
                file.type === "image/jpg" ||
                file.type === "image/png"
        );

        if (validFiles.length !== files.length) {
            alert("Solo se permiten imágenes en formato JPEG, JPG o PNG");
        }

        const nuevosArchivos = validFiles.map((file) => ({
            file, // Archivo original
            preview: URL.createObjectURL(file), // URL temporal para vista previa
        }));

        setArchivos((prevArchivos) => [...prevArchivos, ...nuevosArchivos]);
    };

    // Manejar los archivos arrastrados y soltados
    const handleDrop = (e) => {
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
        }

        const nuevosArchivos = validFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setArchivos((prevArchivos) => [...prevArchivos, ...nuevosArchivos]);
    };

    // Eliminar archivo de la lista
    const eliminarArchivo = (index) => {
        setArchivos((prevArchivos) =>
            prevArchivos.filter((_, i) => i !== index)
        );
    };

    const handleAddTaskClick = () => {
        setShowTaskInput(!showTaskInput); // Cambiar el estado para mostrar o esconder el input
    };

    const handleTaskChange = (e) => {
        setNewTask(e.target.value); // Actualizar el estado con el valor del input
    };

    const handleSaveTask = () => {
        if (newTask.trim() !== "") {
            const nuevaTarea = {
                texto: newTask,
                estado: taskStatus,
                assigned: "Sin asignar", // Valor por defecto si no hay asignación
            };
            setTareas([...tareas, nuevaTarea]);
            setNewTask(""); // Limpiar el input
            setTaskStatus("new"); // Reiniciar el dropdown
            setShowTaskInput(false); // Ocultar el input
        }
    };

    const eliminarTarea = (index) => {
        setTareas(tareas.filter((_, i) => i !== index)); // Eliminar la tarea seleccionada
    };
    const editarTarea = (index) => {
        setEditTaskIndex(index); // Guardar el índice de la tarea a editar
        setEditTaskText(tareas[index].texto); // Cargar el texto de la tarea en el estado
        setEditTaskStatus(tareas[index].estado); // Cargar el estado de la tarea en edición
    };
    // Función para guardar los cambios de una tarea editada
    const guardarEdicion = (index) => {
        const tareasActualizadas = [...tareas];
        tareasActualizadas[index].texto = editTaskText; // Actualizar el texto de la tarea
        tareasActualizadas[index].estado = editTaskStatus; // Actualizar el estado de la tarea
        setTareas(tareasActualizadas); // Actualizar el estado con las tareas editadas
        setEditTaskIndex(null); // Salir del modo de edición
    };

    const handleStatusChange = (e) => {
        setTaskStatus(e.target.value); // Actualiza el valor del estado de la tarea
    };

    const handleMouseEnter = () => {
        setShowSaveIcon(true); // Muestra el ícono al pasar el mouse
    };

    const handleMouseLeave = () => {
        setShowSaveIcon(false); // Oculta el ícono cuando se quita el mouse
    };

    return (
        <div
            className={`historia-usuario planificacion-pagina ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
            >
                <Header />
                <div className="contenido-con-sidebar">
                <SidebarEstudiante
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={proyecto?.NOMBRE_PROYECTO} // Campo del nombre del proyecto
                    fotoProyecto={`http://localhost:8000/storage/${proyecto?.PORTADA_PROYECTO}`} // Ruta completa de la imagen
                />
                {/* Contenido principal */}

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
                                                onClick={() => {
                                                    setEditingTitle(false);
                                                    setHistoria(
                                                        (prevHistoria) => ({
                                                            ...prevHistoria,
                                                            titulo: newTitle,
                                                        })
                                                    );
                                                }}
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
                                        {historia.titulo ||
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
                                            onChange={handleDescriptionChange}
                                            onBlur={handleDescriptionBlur} // Detecta cuando el foco se pierde
                                        />

                                        {/* Botones de Guardar y Cancelar */}
                                        <div className="edit-buttons">
                                            <button
                                                className="btn btn-save"
                                                onClick={() => {
                                                    setEditingDescription(
                                                        false
                                                    );
                                                    setHistoria(
                                                        (prevHistoria) => ({
                                                            ...prevHistoria,
                                                            descripcion:
                                                                newDescription,
                                                        })
                                                    );
                                                }}
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
                                                    ); // Cancelar cambios y restaurar descripción original
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
                                    onClick={() => fileInputRef.current.click()}
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
                                        ¡Arrastre los archivos adjuntos aquí!
                                    </p>
                                )}

                                <div className="preview-container">
                                    {archivos.map((file, index) => (
                                        <div
                                            key={index}
                                            className="preview-item"
                                        >
                                            <img
                                                src={file.preview}
                                                alt={`preview-${index}`}
                                                className="adjunto-imagen"
                                                onClick={() =>
                                                    handleImageClick(
                                                        file.preview
                                                    )
                                                } // Agregar evento de clic
                                            />
                                            <button
                                                className="boton-eliminar"
                                                onClick={() =>
                                                    eliminarArchivo(index)
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
                                            key={index}
                                            className="tarea-item"
                                            onMouseEnter={() => {
                                                setHoveredTaskIndex(index);
                                                setIsHovered(true); // Activar hover
                                            }}
                                            onMouseLeave={() => {
                                                setHoveredTaskIndex(null);
                                                setIsHovered(false); // Desactivar hover
                                            }}
                                        >
                                            <div className="tarea-contenido">
                                                {/* Mostrar número secuencial y título de la tarea */}
                                                {editTaskIndex === index ? (
                                                    <input
                                                        type="text"
                                                        value={editTaskText}
                                                        onChange={(e) =>
                                                            setEditTaskText(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="task-edit-input"
                                                    />
                                                ) : (
                                                    <span className="tarea-texto">
                                                        {/* Aquí se agrega el número secuencial con estilo */}
                                                        <span className="numero-tarea">
                                                            <span>#</span>
                                                            {index + 1}
                                                        </span>
                                                        {tarea.texto}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="tarea-acciones">
                                                {/* Iconos de editar y eliminar */}
                                                {hoveredTaskIndex === index && (
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
                                                                    index
                                                                )
                                                            }
                                                        ></i>
                                                    </>
                                                )}

                                                {/* Estado de la tarea */}
                                                {editTaskIndex === index ? (
                                                    <select
                                                        value={editTaskStatus}
                                                        onChange={(e) =>
                                                            setEditTaskStatus(
                                                                e.target.value
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
                                                        {tarea.estado}
                                                    </span>
                                                )}

                                                {/* Imagen del avatar */}
                                                <img
                                                    src="https://via.placeholder.com/40"
                                                    alt="Perfil"
                                                    className="tarea-perfil-imagen"
                                                />

                                                {/* Texto de asignación */}
                                                <span className="tarea-asignado">
                                                    {tarea.asignado ||
                                                        "Not assigned"}
                                                </span>

                                                {/* Mostrar ícono de flecha solo cuando el mouse está sobre el input */}
                                                {hoveredTaskIndex === index && (
                                                    <i className="fas fa-chevron-down task-assigned-icon"></i>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                            </ul>

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
                                        value={taskStatus} // Cambiar aquí newTaskStatus a taskStatus
                                        onChange={handleStatusChange} // Necesitas esta función para manejar el cambio de estado
                                    >
                                        <option value="new">New</option>
                                        <option value="in-progress">
                                            In Progress
                                        </option>
                                        <option value="ready-for-test">
                                            Ready for Test
                                        </option>
                                        <option value="closed">Closed</option>
                                        <option value="needs-info">
                                            Needs Info
                                        </option>
                                    </select>

                                    {/* Imagen de avatar para asignar */}
                                    <div className="task-assigned-container">
                                        <img
                                            src="https://via.placeholder.com/40"
                                            alt="Not assigned"
                                            className="task-assigned-avatar"
                                        />
                                        {/* Texto "Not assigned" */}
                                        <span className="task-assigned-text">
                                            Not assigned
                                        </span>
                                        {/* Ícono de flecha que solo aparece al hacer hover */}
                                        {isHovered && ( // Mostrar ícono solo cuando el mouse está sobre el input
                                            <i className="fas fa-chevron-down task-assigned-icon"></i>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoriaUsuario;
