import React, { useState, useEffect } from "react";
import axios from "axios";

const SeleccionarEstudianteAleatorio = ({ grupoId }) => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);

    useEffect(() => {
    if (grupoId) {
        const fetchEstudiantes = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/estudiantes/grupo/${grupoId}`,
                    { withCredentials: true }
                );
                setEstudiantes(response.data);  // Se actualiza la lista de estudiantes
            } catch (error) {
                console.error("Error al cargar los estudiantes:", error);
            }
        };

        fetchEstudiantes();
    }
}, [grupoId]); // Se asegura de que grupoId esté disponible para realizar la solicitud


    const seleccionarAleatorio = () => {
        const estudiante = estudiantes[Math.floor(Math.random() * estudiantes.length)];
        setEstudianteSeleccionado(estudiante);
    };

    return (
        <div>
            <button onClick={seleccionarAleatorio}>Seleccionar Estudiante Aleatorio</button>
            <div>
                <h3>Estudiante Seleccionado:</h3>
                {estudianteSeleccionado ? (
                    <div>
                        {estudianteSeleccionado.NOMBRE_EST} {estudianteSeleccionado.APELLIDO_EST}
                    </div>
                ) : (
                    <p>No se ha seleccionado ningún estudiante aún.</p>
                )}
            </div>
        </div>
    );
};

export default SeleccionarEstudianteAleatorio;
