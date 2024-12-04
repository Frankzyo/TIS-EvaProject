import React from "react";
import "../../../css/EstilosModal/ModalErrorRegister.css";
const ModalErrorRegister = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-contenido">
                <h2>{title}</h2>
                <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>{message}</p>
                </div>
                <div className="cont-btn-cr">
                    <button className="close-button" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};
export default ModalErrorRegister;
