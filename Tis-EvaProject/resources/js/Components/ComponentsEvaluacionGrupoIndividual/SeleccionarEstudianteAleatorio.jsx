import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../css/EstilosEvaluacionGrupoIndividual/SeleccionarEstudianteAleatorio.css"; // Archivo CSS para los estilos

const SeleccionarEstudianteAleatorio = ({ grupoId }) => {
    const [estudiantes, setEstudiantes] = useState([]); // Lista completa de estudiantes
    const [estudiantesRestantes, setEstudiantesRestantes] = useState([]); // Lista temporal para asegurar el recorrido único
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEstudiantes = async () => {
            if (!grupoId) return;

            try {
                setLoading(true);
                const response = await axios.get(
                    `http://localhost:8000/api/estudiantes/grupo/${grupoId}`,
                    { withCredentials: true }
                );
                const estudiantesCargados = response.data || [];
                setEstudiantes(estudiantesCargados); // Establece la lista completa
                setEstudiantesRestantes(estudiantesCargados); // Inicializa la lista restante
                setError(null);
            } catch (err) {
                setError(
                    "Error al cargar los estudiantes. Intenta nuevamente."
                );
                console.error("Error al cargar los estudiantes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchEstudiantes();
    }, [grupoId]);

    const seleccionarAleatorio = () => {
        if (estudiantesRestantes.length === 0) {
            // Si ya se recorrieron todos, reinicia la lista restante
            setEstudiantesRestantes([...estudiantes]);
        }

        // Selecciona un estudiante aleatorio de los restantes
        const randomIndex = Math.floor(
            Math.random() * estudiantesRestantes.length
        );
        const estudianteSeleccionado = estudiantesRestantes[randomIndex];

        // Actualiza la lista de estudiantes restantes excluyendo el seleccionado
        const nuevosRestantes = estudiantesRestantes.filter(
            (_, index) => index !== randomIndex
        );
        setEstudiantesRestantes(nuevosRestantes);

        // Establece el estudiante seleccionado
        setEstudianteSeleccionado(estudianteSeleccionado);
    };

    return (
        <div className="seleccionar-estudiante-contenedor">
            <div className="detalles-y-seleccion">
                <div className="seleccion-boton">
                    <button
                        className="seleccionar-estudiante-btn"
                        onClick={seleccionarAleatorio}
                        disabled={loading || estudiantes.length === 0}
                    >
                        {loading
                            ? "Cargando..."
                            : "Seleccionar Estudiante Aleatorio"}
                    </button>
                </div>
                <div className="estudiante-seleccionado-contenedor">
                    <h4 className="seleccion-estudiante-title">
                        Estudiante Seleccionado:
                    </h4>
                    {estudianteSeleccionado ? (
                        <div className="estudiante-seleccionado">
                            <p>
                                <strong>Nombre:</strong>{" "}
                                {estudianteSeleccionado.NOMBRE_EST}
                            </p>
                            <p>
                                <strong>Apellido:</strong>{" "}
                                {estudianteSeleccionado.APELLIDO_EST}
                            </p>
                        </div>
                    ) : (
                        !loading && (
                            <p>No se ha seleccionado ningún estudiante aún.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeleccionarEstudianteAleatorio;
