import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import "../../css/Estilos docente/Rubrica.css";
const Rubrica = ({ cambiarVista }) => {
    const handleCriterioChange = (criterioId, field, value) => {
        setCriterios((prevCriterios) =>
            prevCriterios.map((criterio) =>
                criterio.id === criterioId
                    ? { ...criterio, [field]: value }
                    : criterio
            )
        );
    };

    const handleNivelChange = (criterioId, nivelIndex, field, value) => {
        setCriterios((prevCriterios) =>
            prevCriterios.map((criterio) =>
                criterio.id === criterioId
                    ? {
                          ...criterio,
                          niveles: criterio.niveles.map((nivel, index) =>
                              index === nivelIndex
                                  ? { ...nivel, [field]: value }
                                  : nivel
                          ),
                      }
                    : criterio
            )
        );
    };
    const [criterios, setCriterios] = useState([
        {
            id: 1,
            titulo: "Calidad de código",
            descripcion: "La calidad del código",
            niveles: [
                {
                    puntos: 5,
                    titulo: "Título del nivel",
                    descripcion: "cualquier cualidad/cualidad/cualidad",
                },
                {
                    puntos: 5,
                    titulo: "Título del nivel",
                    descripcion: "cualquier cualidad/cualidad/cualidad",
                },
                {
                    puntos: 5,
                    titulo: "Título del nivel",
                    descripcion: "cualquier cualidad/cualidad/cualidad",
                },
            ],
        },
        {
            id: 2,
            titulo: "",
            descripcion: "",
            niveles: [
                {
                    puntos: "",
                    titulo: "",
                    descripcion: "",
                },
            ],
        },
    ]);
    const eliminarNivel = (criterioId, nivelIndex) => {
        setCriterios((prevCriterios) =>
            prevCriterios.map((criterio) =>
                criterio.id === criterioId
                    ? {
                          ...criterio,
                          niveles: criterio.niveles.filter(
                              (_, index) => index !== nivelIndex
                          ),
                      }
                    : criterio
            )
        );
    };

    const agregarNivel = (criterioId) => {
        setCriterios(
            criterios.map((criterio) => {
                if (criterio.id === criterioId) {
                    return {
                        ...criterio,
                        niveles: [
                            ...criterio.niveles,
                            {
                                puntos: "",
                                titulo: "",
                                descripcion: "",
                            },
                        ],
                    };
                }
                return criterio;
            })
        );
    };

    const agregarCriterio = () => {
        setCriterios([
            ...criterios,
            {
                id: criterios.length + 1,
                titulo: "",
                descripcion: "",
                niveles: [
                    {
                        puntos: "",
                        titulo: "Título del nivel",
                        descripcion: "Descripción",
                    },
                ],
            },
        ]);
    };
    const eliminarCriterio = (criterioId) => {
        setCriterios((prevCriterios) =>
            prevCriterios.filter((criterio) => criterio.id !== criterioId)
        );
    };
    return (
        <div className="container-rubrica">
            <div className="rubrica-container">
                <div className="fila-1">
                    <h1>Rubrica de evaluación</h1>
                    <div className="container-btn">
                        <button className="guardar-btn-rubrica">Guardar</button>
                        <button
                            type="button"
                            onClick={() => cambiarVista("CrearEvaluacion")}
                            className="cancelar-btn-rubrica"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>

                <div className="criterios-lista">
                    {criterios.map((criterio) => (
                        <div key={criterio.id} className="criterio-card">
                            <button
                                className="boton-eliminar-criterio"
                                onClick={() => eliminarCriterio(criterio.id)}
                            >
                                <i className="fa-solid fa-x"></i>
                            </button>
                            <input
                                type="text"
                                className="input-titulo"
                                placeholder="Título *"
                                value={criterio.titulo}
                                onChange={(e) =>
                                    handleCriterioChange(
                                        criterio.id,
                                        "titulo",
                                        e.target.value
                                    )
                                }
                            />
                            <textarea
                                type="text"
                                className="input-descripcion"
                                placeholder="Descripción *"
                                value={criterio.descripcion}
                                onChange={(e) =>
                                    handleCriterioChange(
                                        criterio.id,
                                        "descripcion",
                                        e.target.value
                                    )
                                }
                            />

                            <div className="niveles-grid">
                                {criterio.niveles.map((nivel, index) => (
                                    <div key={index} className="nivel-card">
                                        <button
                                            className="boton-eliminar-nivel"
                                            onClick={() =>
                                                eliminarNivel(
                                                    criterio.id,
                                                    index
                                                )
                                            }
                                        >
                                            <i className="fa-solid fa-x"></i>
                                        </button>
                                        <div className="nivel-grupo">
                                            <label>
                                                Puntos{" "}
                                                <span class="required-asterisk">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={nivel.puntos}
                                                onChange={(e) =>
                                                    handleNivelChange(
                                                        criterio.id,
                                                        index,
                                                        "puntos",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="nivel-grupo">
                                            <label>
                                                Título
                                                <span class="required-asterisk">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={nivel.titulo}
                                                onChange={(e) =>
                                                    handleNivelChange(
                                                        criterio.id,
                                                        index,
                                                        "titulo",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="nivel-grupo">
                                            <label>Descripción</label>
                                            <textarea
                                                value={nivel.descripcion}
                                                onChange={(e) =>
                                                    handleNivelChange(
                                                        criterio.id,
                                                        index,
                                                        "descripcion",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => agregarNivel(criterio.id)}
                                    className="boton-agregar-nivel"
                                >
                                    <PlusCircle />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={agregarCriterio}
                    className="boton-agregar-criterio"
                >
                    <PlusCircle />
                    Añadir criterio
                </button>
            </div>
        </div>
    );
};
export default Rubrica;
