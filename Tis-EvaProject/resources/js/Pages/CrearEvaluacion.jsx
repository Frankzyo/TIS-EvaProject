import React, { useState } from "react";
import "../../css/Estilos docente/CrearEvaluacion.css";
import ReactQuill from "react-quill";
const CrearEvaluacion = ({ cambiarVista }) => {
    const [value, setValue] = useState("");
    return (
        <div className="container-crearEvaluacion">
            <div className="form-crearEv">
                <div className="titulo-crearEv">
                    <h1>Crear Evaluación</h1>
                </div>
                <form action="">
                    <div className="container-formulario">
                        <div className="fila-1">
                            <label htmlFor="">Titulo</label>
                            <input type="text" />
                        </div>
                        <div className="fila-1">
                            <label htmlFor="">Puntos</label>
                            <input type="text" />
                        </div>
                        <div className="fila-2">
                            <label htmlFor="">Fecha de defensa</label>
                            <div className="row-date">
                                <label htmlFor="">Dia 1</label>
                                <input type="Date" />
                                <input type="Date" />
                            </div>
                            <div className="row-date">
                                <label htmlFor="">Dia 2</label>
                                <input type="Date" />
                                <input type="Date" />
                            </div>
                        </div>
                        <div className="fila-2">
                            <div className="date-entrega">
                                <label htmlFor="">Fecha entrega</label>
                                <input type="Date" />
                            </div>
                            <div className="date-entrega">
                                <label htmlFor="">Hora</label>
                                <input type="text" />
                            </div>
                        </div>

                        <div className="fila-2">
                            <label htmlFor="">Instrucciones</label>
                            <div className="rich-text-editor">
                                <ReactQuill
                                    value={value}
                                    onChange={setValue}
                                    placeholder="Escribe aquí las instrucciones..."
                                    modules={{
                                        toolbar: [
                                            [{ header: [1, 2, false] }],
                                            [
                                                "bold",
                                                "italic",
                                                "underline",
                                                "strike",
                                            ],
                                            [
                                                { list: "ordered" },
                                                { list: "bullet" },
                                            ],
                                            ["link"],
                                            [{ align: [] }],
                                            ["clean"],
                                        ],
                                    }}
                                />
                            </div>
                        </div>
                        <div className="fila-2">
                            <div className="met-rub">
                                <label htmlFor="">Metodo</label>
                                <select name="" id="">
                                    <option value="">Docente</option>
                                    <option value="">Estudiante</option>
                                </select>
                            </div>
                            <div className="met-rub ">
                                <label htmlFor="">Rubrica</label>
                                <button
                                    onClick={() => cambiarVista("CrearRubrica")}
                                    type="button"
                                    className="rubrica-btn"
                                >
                                    + Rubrica
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="container-btn-crear">
                        <button className="guardar-btn">Guardar</button>
                        <button
                            onClick={() => cambiarVista("TipoEvaluaciones")}
                            className="cancelar-btn"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default CrearEvaluacion;
