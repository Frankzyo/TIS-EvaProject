import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importación de useNavigate
import SidebarEstudiante from "../Components/SidebarEstudiante";
import Header from "../Components/HeaderEstudiante";
import axios from "axios";
import "../../css/PlanificacionEstudiante.css";
import "../../css/SidebarEstudiante.css";
import "../../css/Proyectos.css";
import "../../css/HistoriaUsuario.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const PlanificacionEstudiante = () => {
    const navigate = useNavigate();
    const [proyecto, setProyecto] = useState(null);
    const [grupo, setGrupo] = useState(null);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sprints, setSprints] = useState([]); // Inicia como lista vacía
    const [historiasUsuario, setHistoriasUsuario] = useState([]);
    const [requerimientos, setRequerimientos] = useState([]);
    const [isEditingReq, setIsEditingReq] = useState(false); // Controla si estamos en modo de edición o creación para el requerimiento
    const [requerimientoAEditar, setRequerimientoAEditar] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // Nuevo estado para modo edición
    const [sprintEditIndex, setSprintEditIndex] = useState(null); // Índice del sprint en edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Modal de confirmación de eliminación
    const [elementTypeToDelete, setElementTypeToDelete] = useState(""); // Tipo de elemento a eliminar
    const [elementToDeleteIndex, setElementToDeleteIndex] = useState(null); // Índice del elemento a eliminar
    const [nuevoSprint, setNuevoSprint] = useState({
        nombre: "",
        fechaInicio: "",
        fechaFin: "",
    });
    const [isConfirmDeleteReqModalOpen, setConfirmDeleteReqModalOpen] =
        useState(false); // Modal específico para confirmación
    const [requerimientoAEliminar, setRequerimientoAEliminar] = useState(null); // Requerimiento a eliminar
    const [selectedImage, setSelectedImage] = useState(null);
    const [isReqModalOpen, setReqModalOpen] = useState(false);
    const [isModalOpenHU, setIsModalOpenHU] = useState(false);
    const [nuevoReq, setNuevoReq] = useState("");
    const [nuevaHU, setNuevaHU] = useState({ titulo: "", descripcion: "" });
    const [archivos, setArchivos] = useState([]);
    const fileInputRef = useRef(null);
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

                    // Extrae los requerimientos de ambos orígenes
                    const requerimientosDocente =
                        response.data.proyecto.requerimientos || [];
                    const requerimientosEstudiante =
                        response.data.grupo.requerimientos || [];

                    // Combina y actualiza el estado de requerimientos
                    setRequerimientos([
                        ...requerimientosDocente,
                        ...requerimientosEstudiante,
                    ]);
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

    const guardarRequerimientoParaGrupo = () => {
        const idGrupo = grupo?.ID_GRUPO;

        if (isEditingReq) {
            // Modo edición: actualiza el requerimiento existente
            axios
                .put(
                    `http://localhost:8000/api/requerimientos/${requerimientos[reqEditIndex].ID_REQUERIMIENTO}`,
                    {
                        ID_GRUPO: idGrupo,
                        DESCRIPCION_REQ: nuevoReq,
                    }
                )
                .then((response) => {
                    console.log("Requerimiento editado:", response.data);
                    const updatedRequerimientos = [...requerimientos];
                    updatedRequerimientos[reqEditIndex] = response.data;
                    setRequerimientos(updatedRequerimientos);
                    cerrarModalReq();
                })
                .catch((error) => {
                    console.error("Error al editar el requerimiento:", error);
                    alert(
                        "Hubo un error al editar el requerimiento. Inténtalo de nuevo."
                    );
                });
        } else {
            // Modo creación: crea un nuevo requerimiento
            axios
                .post(
                    "http://localhost:8000/api/requerimientos/crear-para-grupo",
                    {
                        ID_GRUPO: idGrupo,
                        DESCRIPCION_REQ: nuevoReq,
                    }
                )
                .then((response) => {
                    console.log("Requerimiento creado:", response.data);
                    setRequerimientos([...requerimientos, response.data]);
                    cerrarModalReq();
                })
                .catch((error) => {
                    console.error("Error al crear el requerimiento:", error);
                    alert(
                        "Hubo un error al crear el requerimiento. Inténtalo de nuevo."
                    );
                });
        }
    };

    const toggleSidebar = () => setSidebarCollapsed(!isSidebarCollapsed);
    const abrirModal = () => {
        setIsModalOpen(true);
        setIsEditing(false); // No es edición
        setNuevoSprint({ nombre: "", fechaInicio: "", fechaFin: "" }); // Limpia el formulario
    };
    const abrirModalReq = () => setReqModalOpen(true);
    const abrirModalHU = () => setIsModalOpenHU(true);
    const cerrarModal = () => {
        setIsModalOpen(false);
        setNuevoSprint({ nombre: "", fechaInicio: "", fechaFin: "" });
    };
    const closeModal = () => {
        setSelectedImage(null); // Cierra el modal cuando se hace clic fuera de la imagen
    };
    const editarRequerimiento = (index) => {
        const req = requerimientos[index];
        setRequerimientoAEditar(req); // Establece el requerimiento a editar
        setNuevoReq(req.DESCRIPCION_REQ); // Establece la descripción actual en el estado para el input
        setIsEditingReq(true); // Cambia el estado a edición
        setReqModalOpen(true); // Abre el modal
    };

    const editarHistoriaUsuario = (index) => {
        navigate(`/historia-usuario/${index}`, {
            state: { historia: historiasUsuario[index], numero: index + 1 },
        });
    };

    const editarSprint = (index) => {
        const sprint = sprints[index];
        setIsEditing(true); // Activa modo edición
        setSprintEditIndex(index); // Guarda el índice del sprint
        setNuevoSprint(sprint); // Carga los datos del sprint en el formulario
        setIsModalOpen(true); // Abre el modal
    };

    const eliminarArchivo = (index) => {
        const updatedFiles = archivos.filter((_, i) => i !== index);
        setArchivos(updatedFiles);
    };

    const cerrarModalReq = () => {
        setReqModalOpen(false);
        setNuevoReq(""); // Limpia el campo de input
        setIsEditingReq(false); // Resetea el modo de edición
        setRequerimientoAEditar(null); // Limpia el requerimiento a editar
    };

    const handleHUInputChange = (e) => {
        const { name, value } = e.target;
        setNuevaHU((prevHU) => ({
            ...prevHU,
            [name]: value,
        }));
    };

    const handleFileUpload = (e) => {
        const newFiles = Array.from(e.target.files).filter((file) =>
            ["image/jpeg", "image/jpg", "image/png"].includes(file.type)
        );

        const filesWithPreview = newFiles.map((file) => ({
            ...file,
            preview: URL.createObjectURL(file),
        }));

        setArchivos([...archivos, ...filesWithPreview]);
    };

    const cerrarModalHU = () => {
        setIsModalOpenHU(false);
        setNuevaHU({ titulo: "", descripcion: "" });
        setArchivos([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoSprint({ ...nuevoSprint, [name]: value });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const newFiles = Array.from(e.dataTransfer.files).filter((file) =>
            ["image/jpeg", "image/jpg", "image/png"].includes(file.type)
        );

        const filesWithPreview = newFiles.map((file) => ({
            ...file,
            preview: URL.createObjectURL(file),
        }));

        setArchivos([...archivos, ...filesWithPreview]);
    };

    const guardarSprint = () => {
        if (
            nuevoSprint.nombre &&
            nuevoSprint.fechaInicio &&
            nuevoSprint.fechaFin
        ) {
            if (isEditing) {
                // Si es edición, actualiza el sprint correspondiente
                const updatedSprints = [...sprints];
                updatedSprints[sprintEditIndex] = { ...nuevoSprint };
                setSprints(updatedSprints);
            } else {
                // Si no es edición, crea un nuevo sprint
                setSprints([...sprints, { ...nuevoSprint, historias: [] }]);
            }
            cerrarModal(); // Cierra el modal
        }
    };

    const abrirModalEliminarRequerimiento = (requerimiento) => {
        setRequerimientoAEliminar(requerimiento);
        setConfirmDeleteReqModalOpen(true);
    };

    const guardarHU = () => {
        // Verifica si ya existe una historia con el mismo título
        const historiaDuplicada = historiasUsuario.some(
            (historia) => historia.titulo === nuevaHU.titulo
        );

        if (historiaDuplicada) {
            alert("Ya existe una historia con este nombre.");
            return; // Detiene el proceso de creación si hay un duplicado
        }

        if (nuevaHU.titulo && nuevaHU.descripcion) {
            const nuevaHistoria = {
                titulo: nuevaHU.titulo,
                descripcion: nuevaHU.descripcion,
            };
            setHistoriasUsuario([...historiasUsuario, nuevaHistoria]); // Asegúrate de que siempre estás agregando un objeto con las propiedades correctas.
            cerrarModalHU();
        } else {
            alert("Debes completar el título y la descripción");
        }
    };

    const onDragStart = (e, index, source) => {
        e.dataTransfer.setData("index", index); // Guarda el índice de la historia
        e.dataTransfer.setData("source", source); // Guarda el origen de la historia (historiasUsuario o sprint)
    };
    // Función para manejar cuando se suelta la historia
    const onDrop = (e, destinoIndex, destinoType) => {
        e.preventDefault();
        const origenIndex = parseInt(e.dataTransfer.getData("index"), 10); // Recupera el índice de la historia arrastrada
        const origenType = e.dataTransfer.getData("source"); // Recupera el origen de la historia (historiasUsuario o sprint)

        if (!isNaN(origenIndex)) {
            // Si estamos moviendo de historiasUsuario a sprint
            if (origenType === "historiasUsuario" && destinoType === "sprint") {
                // En lugar de clonar la historia, pasar la referencia original
                const historiaReferenciada = historiasUsuario[origenIndex]; // Referencia directa al objeto original

                // Actualizar la lista de sprints añadiendo la referencia a la historia
                const sprintsActualizados = [...sprints];
                sprintsActualizados[destinoIndex].historias.push(
                    historiaReferenciada
                ); // Inserta la referencia de la historia en el sprint

                setSprints(sprintsActualizados); // Actualiza el estado de sprints
                // No eliminamos la historia de historiasUsuario
            } else if (
                origenType === "historiasUsuario" &&
                destinoType === "historiasUsuario"
            ) {
                // Reordenar las historias en la misma lista
                const historiasReordenadas = [...historiasUsuario];
                const [historiaMovida] = historiasReordenadas.splice(
                    origenIndex,
                    1
                ); // Elimina la historia del índice original
                historiasReordenadas.splice(destinoIndex, 0, historiaMovida); // Inserta la historia en el nuevo índice
                setHistoriasUsuario(historiasReordenadas); // Actualiza la lista de historias
            }
        }
    };

    const onDragOver = (e) => {
        e.preventDefault(); // Permite el drop
    };

    const removeItem = (list, setList, index) =>
        setList(list.filter((_, i) => i !== index));
    const removeHistoriaFromSprint = (sprintIndex, historiaIndex) => {
        const newSprints = [...sprints];
        newSprints[sprintIndex].historias.splice(historiaIndex, 1);
        setSprints(newSprints);
    };
    const removeSprint = (index) => {
        const newSprints = [...sprints];
        newSprints.splice(index, 1);
        setSprints(newSprints);
    };

    const abrirModalConfirmacion = (type, index) => {
        setElementTypeToDelete(type); // Establece el tipo de elemento (requerimiento, sprint, historia)
        setElementToDeleteIndex(index); // Establece el índice del elemento a eliminar
        setIsConfirmModalOpen(true); // Abre el modal de confirmación
    };

    const eliminarElemento = () => {
        if (elementTypeToDelete === "requerimiento") {
            setRequerimientos(
                requerimientos.filter((_, i) => i !== elementToDeleteIndex)
            );
        } else if (elementTypeToDelete === "sprint") {
            setSprints(sprints.filter((_, i) => i !== elementToDeleteIndex));
        } else if (elementTypeToDelete === "historia") {
            setHistoriasUsuario(
                historiasUsuario.filter((_, i) => i !== elementToDeleteIndex)
            );
        }
        setIsConfirmModalOpen(false); // Cierra el modal de confirmación
    };

    const eliminarRequerimiento = (id) => {
        console.log("Intentando eliminar el requerimiento con ID:", id);
        axios
            .delete(
                `http://localhost:8000/api/requerimientos/estudiante/${id}`,
                {
                    withCredentials: true,
                }
            )
            .then((response) => {
                console.log("Requerimiento eliminado:", response.data);
                setRequerimientos(
                    requerimientos.filter((req) => req.ID_REQUERIMIENTO !== id)
                );
                setConfirmDeleteReqModalOpen(false);
            })
            .catch((error) => {
                console.error("Error al eliminar el requerimiento:", error);
                alert("Hubo un error al eliminar el requerimiento.");
            });
    };
    const actualizarRequerimientoParaGrupo = () => {
        if (requerimientoAEditar && requerimientoAEditar.ID_REQUERIMIENTO) {
            axios
                .put(
                    `http://localhost:8000/api/requerimientos/estudiante/${requerimientoAEditar.ID_REQUERIMIENTO}`,
                    {
                        DESCRIPCION_REQ: nuevoReq,
                    },
                    { withCredentials: true }
                )
                .then((response) => {
                    console.log("Requerimiento actualizado:", response.data);
                    setRequerimientos((prevRequerimientos) =>
                        prevRequerimientos.map((req) =>
                            req.ID_REQUERIMIENTO ===
                            requerimientoAEditar.ID_REQUERIMIENTO
                                ? response.data
                                : req
                        )
                    );
                    setReqModalOpen(false); // Cierra el modal después de actualizar
                    setIsEditingReq(false); // Sal del modo de edición
                })
                .catch((error) => {
                    console.error(
                        "Error al actualizar el requerimiento:",
                        error
                    );
                    alert("Hubo un error al actualizar el requerimiento.");
                });
        } else {
            console.error("ID del requerimiento no está definido.");
        }
    };

    return (
        <div
            className={`planificacion-estudiante ${
                isSidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
        >
            <Header />
            <div className="contenido-con-sidebar">
                <SidebarEstudiante
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    nombreProyecto={proyecto?.NOMBRE_PROYECTO} // Campo del nombre del proyecto
                    fotoProyecto={`http://localhost:8000/storage/${proyecto?.PORTADA_PROYECTO}`} // Ruta completa de la imagen
                />

                <div className="contenido-principal">
                    <div className="contenedor-titulo-planificacion">
                        <h1 className="titulo-planificacion">
                            Product Backlog
                        </h1>
                        <hr className="divisor-planificacion" />
                    </div>

                    <div className="contenedor-principal">
                        <div className="contenedor-requerimientos">
                            <h2 className="titulo-requerimientos">
                                Requerimientos
                            </h2>
                            <div className="lista-requerimientos">
                                {requerimientos.map((req, index) => (
                                    <div
                                        key={index}
                                        className="item-requerimiento"
                                    >
                                        <span
                                            className="texto-item"
                                            dangerouslySetInnerHTML={{
                                                __html: req.DESCRIPCION_REQ,
                                            }}
                                        ></span>

                                        {/* Mostrar botones de edición y eliminación solo si fue creado por el estudiante */}
                                        {req.ID_GRUPO ? (
                                            <div className="iconos-acciones">
                                                <i
                                                    className="fas fa-edit icono-editar"
                                                    onClick={() =>
                                                        editarRequerimiento(
                                                            index
                                                        )
                                                    }
                                                ></i>
                                                <i
                                                    className="fas fa-trash-alt icono-eliminar"
                                                    onClick={() =>
                                                        abrirModalEliminarRequerimiento(
                                                            req
                                                        )
                                                    }
                                                ></i>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>

                            {/* Botón para agregar un nuevo requerimiento */}
                            <button
                                className="boton-agregar"
                                onClick={abrirModalReq}
                            >
                                + Requerimiento
                            </button>
                        </div>
                        <div className="contenedor-historias">
                            <h2 className="titulo-historias">
                                Historias de Usuario
                            </h2>
                            {historiasUsuario.length === 0 ? (
                                <p className="sprint-mensaje-vacio">
                                    No hay Historias de Usuario. Añade una para
                                    empezar.
                                </p>
                            ) : (
                                <div className="lista-historias">
                                    {historiasUsuario.map((historia, index) => (
                                        <div
                                            key={index}
                                            className="item-historia"
                                            draggable
                                            onDragStart={(e) =>
                                                onDragStart(
                                                    e,
                                                    index,
                                                    "historiasUsuario"
                                                )
                                            }
                                            onDragOver={onDragOver}
                                            onDrop={(e) =>
                                                onDrop(
                                                    e,
                                                    index,
                                                    "historiasUsuario"
                                                )
                                            }
                                        >
                                            {/* Se agrega el número secuencial seguido del título */}
                                            {typeof historia === "object" &&
                                            historia !== null ? (
                                                <span>
                                                    #{index + 1}{" "}
                                                    {historia.titulo}{" "}
                                                    {/* Mostrando el número secuencial */}
                                                </span>
                                            ) : (
                                                <span>
                                                    Error: historia no es un
                                                    objeto válido
                                                </span>
                                            )}
                                            <div className="iconos-acciones">
                                                <i
                                                    className="fas fa-edit icono-editar"
                                                    onClick={() =>
                                                        editarHistoriaUsuario(
                                                            index
                                                        )
                                                    }
                                                ></i>
                                                <i
                                                    className="fas fa-trash-alt icono-eliminar"
                                                    onClick={() =>
                                                        abrirModalConfirmacion(
                                                            "historia",
                                                            index
                                                        )
                                                    }
                                                ></i>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                className="boton-anadir-sprint"
                                onClick={abrirModalHU}
                            >
                                + Historia de usuario
                            </button>
                        </div>
                        <div className="contenedor-sprints">
                            <h2 className="titulo-sprints">Sprints</h2>
                            {sprints.length === 0 ? (
                                <p className="sprint-mensaje-vacio">
                                    No hay sprints. Añade uno para empezar.
                                </p>
                            ) : (
                                <div className="lista-sprints">
                                    {sprints.map((sprint, index) => (
                                        <div
                                            key={index}
                                            className="sprint"
                                            onDrop={(e) => {
                                                e.preventDefault(); // Evita el comportamiento por defecto
                                                const historiaIndex =
                                                    e.dataTransfer.getData(
                                                        "index"
                                                    );
                                                if (historiaIndex !== null) {
                                                    const historiaArrastrada =
                                                        historiasUsuario[
                                                            historiaIndex
                                                        ];

                                                    // Verifica si la historia ya existe en el sprint
                                                    const yaExiste =
                                                        sprint.historias.some(
                                                            (historia) =>
                                                                historia.titulo ===
                                                                historiaArrastrada.titulo
                                                        );

                                                    if (!yaExiste) {
                                                        // Si no existe, la agregamos al sprint
                                                        const sprintActualizado =
                                                            {
                                                                ...sprint,
                                                                historias: [
                                                                    ...sprint.historias,
                                                                    historiaArrastrada,
                                                                ],
                                                            };
                                                        const sprintsActualizados =
                                                            [...sprints];
                                                        sprintsActualizados[
                                                            index
                                                        ] = sprintActualizado;
                                                        setSprints(
                                                            sprintsActualizados
                                                        );
                                                    } else {
                                                        alert(
                                                            "Esta historia ya está en el sprint."
                                                        ); // Evita duplicados
                                                    }
                                                }
                                            }}
                                            onDragOver={(e) =>
                                                e.preventDefault()
                                            } // Permitir arrastrar elementos sobre el contenedor
                                        >
                                            <div className="sprint-header">
                                                <h3 className="sprint-titulo">
                                                    {sprint.nombre}
                                                </h3>
                                                <div className="iconos-acciones">
                                                    <i
                                                        className="fas fa-edit icono-editar"
                                                        onClick={() =>
                                                            editarSprint(index)
                                                        }
                                                    ></i>
                                                    <i
                                                        className="fas fa-trash-alt icono-eliminar"
                                                        onClick={() =>
                                                            abrirModalConfirmacion(
                                                                "sprint",
                                                                index
                                                            )
                                                        }
                                                    ></i>
                                                </div>
                                            </div>

                                            <p className="sprint-fecha">
                                                {sprint.fechaInicio} -{" "}
                                                {sprint.fechaFin}
                                            </p>
                                            <hr className="divisor-titulo-sprints" />
                                            <div className="sprint-contenido">
                                                {sprint.historias.length > 0 ? (
                                                    sprint.historias.map(
                                                        (historia, i) => (
                                                            <div
                                                                key={i}
                                                                className="item-historia-sprint"
                                                            >
                                                                {/* Aquí se muestra el número de la historia más su título */}
                                                                <span>
                                                                    #
                                                                    {historiasUsuario.findIndex(
                                                                        (h) =>
                                                                            h.titulo ===
                                                                            historia.titulo
                                                                    ) + 1}{" "}
                                                                    {
                                                                        historia.titulo
                                                                    }
                                                                </span>
                                                                <div className="iconos-acciones">
                                                                    <i
                                                                        className="fas fa-trash-alt icono-eliminar"
                                                                        onClick={() =>
                                                                            removeHistoriaFromSprint(
                                                                                index,
                                                                                i
                                                                            )
                                                                        }
                                                                    ></i>
                                                                </div>
                                                            </div>
                                                        )
                                                    )
                                                ) : (
                                                    <p>
                                                        Arrastra aquí las
                                                        historias de usuario
                                                    </p>
                                                )}
                                            </div>
                                            <button className="boton-panel">
                                                Panel de tareas
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                className="boton-anadir-sprint"
                                onClick={abrirModal}
                            >
                                + Sprint
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="sprint-modal-overlay">
                    <div className="sprint-modal">
                        <h2>{isEditing ? "Editar Sprint" : "Nuevo Sprint"}</h2>
                        <div className="field-container">
                            <label htmlFor="nombre">Nombre del sprint:</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                placeholder="Nombre del sprint"
                                value={nuevoSprint.nombre}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="modale-date-fields">
                            <div className="field-container">
                                <label>Fecha Inicio:</label>
                                <input
                                    type="date"
                                    name="fechaInicio"
                                    value={nuevoSprint.fechaInicio}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="field-container">
                                <label>Fecha Fin:</label>
                                <input
                                    type="date"
                                    name="fechaFin"
                                    value={nuevoSprint.fechaFin}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="modale-buttons">
                            <button
                                className="modale-button modale-button-cancelar"
                                onClick={cerrarModal}
                            >
                                Cancelar
                            </button>
                            <button
                                className="modale-button modale-button-guardar"
                                onClick={guardarSprint}
                            >
                                {isEditing ? "Guardar" : "Añadir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isReqModalOpen && (
                <div className="requerimiento-modal-overlay">
                    <div className="requerimiento-modal">
                        <h2>
                            {isEditingReq
                                ? "Editar Requerimiento"
                                : "Nuevo Requerimiento"}
                        </h2>
                        <div className="field-container">
                            <label htmlFor="requerimiento">
                                Requerimiento:
                            </label>
                            <input
                                type="text"
                                id="requerimiento"
                                placeholder="Requerimiento"
                                value={nuevoReq}
                                onChange={(e) => setNuevoReq(e.target.value)}
                            />
                        </div>
                        <div className="modale-buttons">
                            <button
                                onClick={cerrarModalReq}
                                className="modale-button modale-button-cancelar"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={
                                    isEditingReq
                                        ? actualizarRequerimientoParaGrupo
                                        : guardarRequerimientoParaGrupo
                                }
                                className="modale-button modale-button-guardar"
                            >
                                {isEditingReq ? "Guardar cambios" : "Guardar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpenHU && (
                <div className="hu-modal-overlay">
                    <div className="hu-modal">
                        <h2>Nueva Historia de Usuario</h2>

                        <div className="modal-field">
                            <label htmlFor="titulo">Título:</label>
                            <input
                                type="text"
                                id="titulo"
                                name="titulo"
                                placeholder="Ingrese el título"
                                value={nuevaHU.titulo}
                                onChange={handleHUInputChange}
                            />
                        </div>

                        <div className="modal-field">
                            <label htmlFor="descripcion">Descripción:</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                placeholder="Ingrese la descripción"
                                value={nuevaHU.descripcion}
                                onChange={handleHUInputChange}
                            />
                        </div>

                        <div className="adjuntos-container">
                            <div className="adjuntos-info">
                                <span>{archivos.length} Adjuntos</span>
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
                                className={`drag-drop-zone ${
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
                                            onClick={() =>
                                                setSelectedImage(file.preview)
                                            } // Al hacer clic en la imagen, abrirá el modal
                                        >
                                            <img
                                                src={file.preview}
                                                alt={`preview-${index}`}
                                            />
                                            <button
                                                className="boton-eliminar"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Evita que el clic de eliminación abra el modal
                                                    eliminarArchivo(index);
                                                }}
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

                        <div className="hu-modal-buttons">
                            <button
                                className="hu-modal-button hu-modal-button-cancelar"
                                onClick={cerrarModalHU}
                            >
                                Cancelar
                            </button>
                            <button
                                className="hu-modal-button hu-modal-button-crear"
                                onClick={guardarHU}
                            >
                                Crear
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isConfirmModalOpen && (
                <div className="confirm-modal">
                    <div className="confirm-modal-content">
                        <h2>Confirmar eliminación</h2>
                        <p>
                            ¿Está seguro de que desea eliminar{" "}
                            {elementTypeToDelete === "historia"
                                ? "esta historia de usuario"
                                : `este ${elementTypeToDelete}`}
                            ?
                        </p>
                        <div className="confirm-modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setIsConfirmModalOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="delete-btn"
                                onClick={eliminarElemento}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isConfirmDeleteReqModalOpen && (
                <div className="confirm-modal">
                    <div className="confirm-modal-content">
                        <h2>Confirmar eliminación</h2>
                        <p>
                            ¿Está seguro de que desea eliminar este
                            requerimiento?
                        </p>
                        <div className="confirm-modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() =>
                                    setConfirmDeleteReqModalOpen(false)
                                }
                            >
                                Cancelar
                            </button>
                            <button
                                className="delete-btn"
                                onClick={() =>
                                    eliminarRequerimiento(
                                        requerimientoAEliminar.ID_REQUERIMIENTO
                                    )
                                }
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanificacionEstudiante;
