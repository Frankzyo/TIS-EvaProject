// ModalMensajeExito.jsx
import React from "react";
import "../../css/ModalMensajeExito.css";

const ModalMensajeExito = ({ message, onClose }) => {
    return (
        <div className="success-modal">
            <div className="success-modal-content">
                <h3>Mensaje</h3>
                <div className="success-message">
                    <i className="fas fa-check-circle"></i>
                    <p>{message}</p>
                </div>
                <button onClick={onClose} className="create-btn">
                    Aceptar
                </button>
            </div>
        </div>
    );
};

export default ModalMensajeExito;
