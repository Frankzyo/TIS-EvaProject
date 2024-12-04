import React from "react";
import { useNavigate } from "react-router-dom";
import "../../../css/EstilosModal/RegistroModal.css"; // Asegúrate de tener un archivo CSS para los estilos

const RegistroModal = ({ mensaje, redirectTo }) => {
    const navigate = useNavigate();

    const handleAccept = () => {
        navigate(redirectTo);
    };

    return (
        <div className="registro-modal-overlay-custom">
            <div className="registro-modal-content-custom">
                <h2>Registro Requerido</h2>
                <p>{mensaje}</p>
                <button
                    onClick={handleAccept}
                    className="seleccionar-usuario-modal-close"
                >
                    Aceptar
                </button>
            </div>
        </div>
    );
};

export default RegistroModal;
