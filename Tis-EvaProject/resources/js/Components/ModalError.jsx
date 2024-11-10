import React from "react";
import "../../css/ModalError.css"; // Asegúrate de importar el CSS necesario para el estilo del modal

const ModalError = ({ title = "Error", errorMessage, closeModal }) => {
    return (
        <div className="error-modal">
            <div className="error-modal-content">
                <h3>{title}</h3>
                <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    <p>{errorMessage}</p>
                </div>
                <button
                    onClick={closeModal}
                    className="create-btn"
                >
                    Aceptar
                </button>
            </div>
            
        </div>
    );
};

export default ModalError;
