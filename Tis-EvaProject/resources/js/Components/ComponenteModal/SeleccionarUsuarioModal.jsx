import React, { useState } from "react";
import "../../../css/EstilosModal/SeleccionarUsuarioModal.css";

const SeleccionarUsuarioModal = ({
    isOpen,
    onClose,
    estudiantes,
    onSelectUser,
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredEstudiantes = estudiantes.filter((estudiante) =>
        `${estudiante.NOMBRE_EST} ${estudiante.APELLIDO_EST}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return isOpen ? (
        <div className="seleccionar-usuario-modal-overlay">
            <div className="seleccionar-usuario-modal">
                <h2>Selecciona usuario asignado</h2>
                <input
                    type="text"
                    placeholder="Buscar usuarios"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="seleccionar-usuario-modal-input"
                />
                <div className="seleccionar-usuario-modal-list">
                    {filteredEstudiantes.length > 0 ? (
                        filteredEstudiantes.map((estudiante, index) => (
                            <div
                                key={estudiante.ID_EST || `estudiante-${index}`}
                                className="seleccionar-usuario-modal-item"
                                onClick={() => onSelectUser(estudiante)}
                            >
                                <div className="usuario-item-content">
                                    <img
                                        src={`http://localhost:8000/storage/${estudiante.FOTO_EST}`}
                                        alt="Foto de perfil"
                                        className="usuario-foto"
                                    />
                                    <div className="usuario-info">
                                        <p className="usuario-nombre">
                                            {`${estudiante.NOMBRE_EST} ${estudiante.APELLIDO_EST}`}
                                        </p>
                                        <p className="usuario-rol">
                                            {estudiante.ROL_EST}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No se encontraron usuarios</p>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="seleccionar-usuario-modal-close"
                >
                    Cerrar
                </button>
            </div>
        </div>
    ) : null;
};

export default SeleccionarUsuarioModal;
