// RubricaItem.jsx
import React, { useState } from "react";
import CriterioItem from "./CriterioItem";
import "../../../css/ComponentsRubrica/RubricaItem.css";

const RubricaItem = ({ rubrica, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const maxPuntaje = (rubrica.criterios || []).reduce((total, criterio) => {
        const criterioMaxPuntaje = Math.max(
            ...(criterio.niveles || []).map((nivel) =>
                Number(nivel.puntos || 0)
            )
        );
        return total + criterioMaxPuntaje;
    }, 0);

    return (
        <div className="rubrica-item">
            <div className="rubrica-header">
                <div className="rubrica-header-left">
                    <div className="rubrica-title-container">
                        <h3 className="rubrica-title">
                            {rubrica.NOMBRE_RUBRICA || rubrica.titulo}
                        </h3>
                        <span className="max-puntaje">
                            /
                            {rubrica.PESO_RUBRICA !== undefined
                                ? rubrica.PESO_RUBRICA
                                : rubrica.peso}
                        </span>
                    </div>
                    <p className="rubrica-description">
                        {rubrica.DESCRIPCION_RUBRICA || rubrica.descripcion}
                    </p>
                </div>
                <div className="project-actions">
                    <button className="expand-btn" onClick={toggleExpand}>
                        <i
                            className={`fas ${
                                isExpanded ? "fa-chevron-up" : "fa-chevron-down"
                            }`}
                        ></i>
                    </button>
                    <button className="action-btn" onClick={onEdit}>
                        <i className="fas fa-pen"></i>
                    </button>
                    <button className="action-btn" onClick={onDelete}>
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            {isExpanded ? (
                <div className="criterios-list">
                    {(rubrica.criterios || []).map((criterio, index) => (
                        <CriterioItem key={index} criterio={criterio} />
                    ))}
                </div>
            ) : (
                <div className="criterios-placeholder">
                    {(rubrica.criterios || []).map((criterio, index) => (
                        <div key={index} className="criterio-placeholder">
                            <h4 className="criterio-placeholder-title">
                                {criterio.NOMBRE_CRITERIO || criterio.titulo}
                            </h4>
                            <div className="criterio-placeholder-bars">
                                {(criterio.niveles || []).map(
                                    (_, nivelIndex) => (
                                        <div
                                            key={nivelIndex}
                                            className="criterio-placeholder-rect"
                                        ></div>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RubricaItem;
