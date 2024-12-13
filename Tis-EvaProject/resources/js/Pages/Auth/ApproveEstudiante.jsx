import React, { useEffect, useState } from "react";
import HeaderProyecto from "../../Components/ComponenteHeader/HeaderProyecto";
import "../../../css/EstilosDocente/Perfil.css";
import "../../../css/auth/ApproveAccounts.css";
import axios from "axios";

const ApproveEstudiante = () => {
    const [pendingStudents, setPendingStudents] = useState([]);
    const [activeOption, setActiveOption] = useState("Usuarios Pendientes");

    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("Token encontrado en localStorage:", token);

        if (activeOption === "Usuarios Pendientes") {
            axios
                .get("http://localhost:8000/api/pending-students", {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    if (
                        response.headers["content-type"].includes(
                            "application/json"
                        )
                    ) {
                        console.log("Estudiantes pendientes:", response.data);
                        setPendingStudents(response.data);
                    } else {
                        console.error("La respuesta no es JSON", response);
                    }
                })
                .catch((error) => {
                    if (error.response && error.response.status === 401) {
                        console.error(
                            "Error de autenticación: el usuario no está autorizado."
                        );
                    } else {
                        console.error("Otro error:", error);
                    }
                });
        }
    }, [activeOption]);

    const handleApproveStudent = async (studentId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `http://localhost:8000/api/approve-student/${studentId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert(response.data.message);
            setPendingStudents(
                pendingStudents.filter(
                    (student) => student.ID_EST !== studentId
                )
            );
        } catch (error) {
            console.error(error);
            alert("Error al aprobar el estudiante.");
        }
    };

    return (
        <div className="perfil-container">
            <HeaderProyecto isModalOpen={false} />
            <div className="perfil-content">
                <aside className="perfil-sidebar">
                    <ul>
                        <li
                            className={`sidebar-item ${
                                activeOption === "Usuarios Pendientes"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                setActiveOption("Usuarios Pendientes")
                            }
                        >
                            Estudiantes Pendientes
                        </li>
                    </ul>
                </aside>
                <main className="perfil-main">
                    <h2 className="approve-users-title">
                        Estudiantes Pendientes de Aprobación
                    </h2>
                    <div className="approve-users-list">
                        {pendingStudents.length > 0 ? (
                            pendingStudents.map((student) => (
                                <div
                                    key={student.ID_EST}
                                    className="approve-users-card"
                                >
                                    <img
                                        src={
                                            student.FOTO_EST
                                                ? `http://localhost:8000/storage/${student.FOTO_EST}`
                                                : "https://via.placeholder.com/250"
                                        }
                                        alt={`${student.NOMBRE_EST} ${student.APELLIDO_EST}`}
                                        className="approve-users-profile-image"
                                    />
                                    <div className="approve-users-info">
                                        <div className="approve-users-info-item">
                                            <span className="approve-users-label">
                                                NOMBRE
                                            </span>
                                            <span className="approve-users-value">
                                                {student.NOMBRE_EST}
                                            </span>
                                        </div>
                                        <div className="approve-users-info-item">
                                            <span className="approve-users-label">
                                                APELLIDOS
                                            </span>
                                            <span className="approve-users-value">
                                                {student.APELLIDO_EST}
                                            </span>
                                        </div>
                                        <div className="approve-users-info-item">
                                            <span className="approve-users-label">
                                                Correo
                                            </span>
                                            <span className="approve-users-value">
                                                {student.EMAIL_EST}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="change-photo-btn"
                                        onClick={() =>
                                            handleApproveStudent(student.ID_EST)
                                        }
                                    >
                                        Aprobar
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="approve-users-no-pending">
                                No hay estudiantes pendientes de aprobación.
                            </p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ApproveEstudiante;
