import React from "react";
import "../../../css/ComponentsRubrica/NivelItem.css";

const NivelItem = ({ nivel }) => (
    <div className="nivel-item">
        <h5 className="nivel-title">
            {nivel.TITULO_NIVEL || nivel.titulo}{" "}
            <span>{nivel.PUNTOS !== undefined ? `${nivel.PUNTOS} puntos` : `${nivel.puntos} puntos`}</span>
        </h5>
        <p className="nivel-description">
            {nivel.DESCRIPCION_NIVEL || nivel.descripcion}
        </p>
    </div>
);


export default NivelItem;
