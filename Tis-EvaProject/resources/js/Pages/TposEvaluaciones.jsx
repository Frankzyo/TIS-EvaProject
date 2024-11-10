import React from "react";
import "../../css/Estilos docente/TipoEvaluaciones.css";
const TposEvaluaciones = ({ cambiarVista }) => {
    const evaluaciones = [
        { id: 1, nombre: "Prueba 1" },
        { id: 2, nombre: "Prueba 2" },
        { id: 3, nombre: "Prueba 3" },
        { id: 4, nombre: "Prueba 4" },
        { id: 5, nombre: "Prueba 5" },
        { id: 5, nombre: "Prueba 6" },
        { id: 6, nombre: "Prueba 7" },
    ];

    return (
        <div className="container-tipoevaluaciones">
            <div className="container-titulo">
                <h1>Tipos Evaluaciones</h1>
            </div>
            <hr className="divisor-eva" />
            <div className="container-evaluaciones">
                <div className="evaluaciones">
                    {evaluaciones.map((evaluacion, key) => (
                        <div className="evaluacion" key={key}>
                            <div className="evaluacion-titulo">
                                <i className="fa-solid fa-clipboard-list"></i>
                                <label className="evaluacion-nombre">
                                    {evaluacion.nombre}
                                </label>
                            </div>
                            <div className="configuracion">
                                <button className="config-evaluacion">
                                    <i className="fas fa-pen"></i>
                                </button>
                                <button className="config-evaluacion">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="nuevo-eva">
                    <button
                        className="btn-evaluacion"
                        onClick={() => cambiarVista("CrearEvaluacion")}
                    >
                        <i className="fas fa-plus"></i>{" "}
                        <span>Nueva Evaluación</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
export default TposEvaluaciones;
