import React from "react";
import "../../css/ModalConfirmacion.css";

const ModalConfirmacion = ({ show, onClose, onConfirm, title, message }) => {
    if (!show) return null;

    return (
        <div className="confirm-modal">
            <div className="confirm-modal-content">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-modal-actions">
                    <button onClick={onClose} className="cancel-btn">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className="delete-btn">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmacion;
