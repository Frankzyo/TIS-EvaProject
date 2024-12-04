import React, { useState } from "react";
import NivelItem from "./NivelItem";
import "../../../css/EstilosRubrica/CriterioItem.css";

const CriterioItem = ({ criterio }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="criterio-item">
            <div className="criterio-header">
                <h4 className="criterio-title">
                    {criterio.NOMBRE_CRITERIO || criterio.titulo}
                </h4>
                <div className="criterio-actions">
                    <span className="max-score">
                        /
                        {criterio.PESO_CRITERIO !== undefined
                            ? criterio.PESO_CRITERIO
                            : criterio.maxPuntaje}
                    </span>

                    <button className="expand-btn" onClick={toggleExpand}>
                        <i
                            className={`fas ${
                                isExpanded ? "fa-chevron-up" : "fa-chevron-down"
                            }`}
                        ></i>
                    </button>
                </div>
            </div>
            <p className="criterio-description">
                {criterio.DESCRIPCION_CRITERIO || criterio.descripcion}
            </p>

            {isExpanded && (
                <div className="niveles-list">
                    {(criterio.niveles || []).map((nivel, index) => (
                        <NivelItem key={index} nivel={nivel} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CriterioItem;
