import React from "react";
import "../../css/PlanillaSeguimiento.css";
const PlanillaSeguimiento = () => {
    return (
        <div className="container-planilla">
            <div className="cont-tit">
                <div className="titulo-pl">
                    <h2>Planilla de seguimiento</h2>
                </div>
                <div className="parf-fech">
                    <p>Fecha: 19 de sep. 2024 02 de oct. 2024</p>
                </div>
            </div>
            <div className="cont-bot">
                <div className="cont-sel">
                    <div className="selec-eq">
                        <select id="dropdown">
                            <option value="opcion1">Opción 1</option>
                            <option value="opcion2">Opción 2</option>
                            <option value="opcion3">Opción 3</option>
                        </select>
                    </div>
                    <div className="select-sprint">
                        <select id="dropdown">
                            <option value="opcion1">Opción 1</option>
                            <option value="opcion2">Opción 2</option>
                            <option value="opcion3">Opción 3</option>
                        </select>
                    </div>
                </div>
                <div className="fech">
                    <input type="date" />
                </div>
            </div>
            <div className="cont-3">
                <div className="cont-pl">
                    <div className="parf-fech-2">
                        <p>Fecha: 19 de sep. 2024 02 de oct. 2024</p>
                    </div>
                    <div className="planilla">
                        <table border="1">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Edad</th>
                                    <th>País</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="fila">
                                    <td>Juan</td>
                                    <td>25</td>
                                    <td>España</td>
                                </tr>
                                <tr className="fila">
                                    <td>María</td>
                                    <td>30</td>
                                    <td>Argentina</td>
                                </tr>
                                <tr className="fila">
                                    <td>Carlos</td>
                                    <td>28</td>
                                    <td>México</td>
                                </tr>
                                <tr className="fila">
                                    <td>Juan</td>
                                    <td>25</td>
                                    <td>España</td>
                                </tr>
                                <tr className="fila">
                                    <td>María</td>
                                    <td>30</td>
                                    <td>Argentina</td>
                                </tr>
                                <tr className="fila">
                                    <td>Carlos</td>
                                    <td>28</td>
                                    <td>México</td>
                                </tr>
                                <tr className="fila">
                                    <td>Carlos</td>
                                    <td>28</td>
                                    <td>México</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bt-gen-pl">
                    <button> Planilla</button>
                </div>
            </div>
        </div>
    );
};
export default PlanillaSeguimiento;
