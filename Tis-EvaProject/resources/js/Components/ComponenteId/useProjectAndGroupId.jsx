import { useState, useEffect } from "react";
import axios from "axios";

const useProjectAndGroupId = () => {
    const [projectId, setProjectId] = useState(() => localStorage.getItem("projectId"));
    const [groupId, setGroupId] = useState(() => localStorage.getItem("groupId"));
    const [loading, setLoading] = useState(!projectId || !groupId);

    useEffect(() => {
        // Solo realiza la solicitud si projectId o groupId no están en localStorage
        if (!projectId || !groupId) {
            const obtenerProyectoYGrupo = async () => {
                try {
                    const response = await axios.get("http://localhost:8000/estudiante/proyecto-grupo", {
                        withCredentials: true
                    });

                    if (response.data) {
                        const newProjectId = response.data.proyecto.ID_PROYECTO;
                        const newGroupId = response.data.grupo.ID_GRUPO;

                        setProjectId(newProjectId);
                        setGroupId(newGroupId);

                        // Guarda en localStorage para futuros accesos
                        localStorage.setItem("projectId", newProjectId);
                        localStorage.setItem("groupId", newGroupId);
                    }
                } catch (error) {
                    console.error("Error al obtener projectId y groupId:", error);
                } finally {
                    setLoading(false); // Termina el estado de carga
                }
            };

            obtenerProyectoYGrupo();
        } else {
            setLoading(false); // Ya están en localStorage, no es necesario cargar
        }
    }, [projectId, groupId]);

    return { projectId, groupId, loading };
};

export default useProjectAndGroupId;
