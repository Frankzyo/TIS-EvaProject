import React, { useState, useEffect } from "react";

const FormHeader = ({
    tituloFormulario,
    setTituloFormulario,
    descripcionFormulario,
    setDescripcionFormulario,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    puntuacionTotal,
    setPuntuacionTotal,
    datosIniciales, // Recibir datos iniciales desde el backend
}) => {
    const [errores, setErrores] = useState({});

    // Cargar datos iniciales al montar el componente
    useEffect(() => {
        if (datosIniciales) {
            setTituloFormulario(datosIniciales?.TITULO_EVAL_CRUZADA || "");
            setDescripcionFormulario(datosIniciales?.DESCRIPCION_EVAL_CRUZADA || "");
            setFechaInicio(datosIniciales?.FECHA_INICIO_EVAL || "");
            setFechaFin(datosIniciales?.FECHA_FIN_EVAL || "");
            setPuntuacionTotal(datosIniciales?.PUNTUACION_TOTAL_EVAL || 0);
        }
    }, [
        datosIniciales,
        setTituloFormulario,
        setDescripcionFormulario,
        setFechaInicio,
        setFechaFin,
        setPuntuacionTotal,
    ]);

    const validarCampos = (campo, valor) => {
        const nuevosErrores = { ...errores };

        // Validar título
        if (campo === "tituloFormulario" || campo === "all") {
            if (!valor?.trim()) {
                nuevosErrores.titulo = "El título es obligatorio.";
            } else {
                delete nuevosErrores.titulo;
            }
        }

        // Validar descripción
        if (campo === "descripcionFormulario" || campo === "all") {
            if (!valor?.trim()) {
                nuevosErrores.descripcion = "La descripción es obligatoria.";
            } else {
                delete nuevosErrores.descripcion;
            }
        }

        // Validar fecha de inicio
        if (campo === "fechaInicio" || campo === "all") {
            if (!valor) {
                nuevosErrores.fechaInicio = "La fecha de inicio es obligatoria.";
            } else {
                delete nuevosErrores.fechaInicio;
            }
        }

        // Validar fecha de fin
        if (campo === "fechaFin" || campo === "all") {
            if (!valor) {
                nuevosErrores.fechaFin = "La fecha de fin es obligatoria.";
            } else {
                delete nuevosErrores.fechaFin;
            }
        }

        // Validar rango de fechas
        if (
            (campo === "fechaInicio" || campo === "fechaFin" || campo === "all") &&
            fechaInicio &&
            fechaFin
        ) {
            if (new Date(fechaInicio) > new Date(fechaFin)) {
                nuevosErrores.fecha = "La fecha de inicio no puede ser posterior a la fecha de fin.";
            } else {
                delete nuevosErrores.fecha;
            }
        }

        // Validar puntuación total
        if (campo === "puntuacionTotal" || campo === "all") {
            if (!valor || valor <= 0) {
                nuevosErrores.puntuacion = "La puntuación total debe ser mayor a 0.";
            } else {
                delete nuevosErrores.puntuacion;
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleChange = (setter, campo) => (e) => {
        const valor = campo === "puntuacionTotal" ? Number(e.target.value) : e.target.value;
        setter(valor);
        validarCampos(campo, valor);
    };

    return (
        <div className="form-header">
            {/* Título */}
            <input
                type="text"
                className={`form-title ${errores.titulo ? "error-input" : ""}`}
                placeholder="Ingrese el título de la Evaluación"
                value={tituloFormulario}
                onChange={handleChange(setTituloFormulario, "tituloFormulario")}
            />
            {errores.titulo && <p className="error-message">{errores.titulo}</p>}

            {/* Descripción */}
            <textarea
                className={`form-description ${errores.descripcion ? "error-input" : ""}`}
                placeholder="Descripción del formulario"
                value={descripcionFormulario}
                onChange={handleChange(setDescripcionFormulario, "descripcionFormulario")}
            />
            {errores.descripcion && <p className="error-message">{errores.descripcion}</p>}

            {/* Fechas */}
            <div className="form-dates">
                <label>
                    Fecha de inicio:
                    <input
                        type="date"
                        className={errores.fechaInicio ? "error-input" : ""}
                        value={fechaInicio}
                        onChange={handleChange(setFechaInicio, "fechaInicio")}
                    />
                </label>
                {errores.fechaInicio && <p className="error-message">{errores.fechaInicio}</p>}

                <label>
                    Fecha de fin:
                    <input
                        type="date"
                        className={errores.fechaFin ? "error-input" : ""}
                        value={fechaFin}
                        onChange={handleChange(setFechaFin, "fechaFin")}
                    />
                </label>
                {errores.fechaFin && <p className="error-message">{errores.fechaFin}</p>}
                {errores.fecha && <p className="error-message">{errores.fecha}</p>}
            </div>

            {/* Puntuación total */}
            <div className="form-dates">
                <label>
                    Puntuación Total:
                    <input
                        type="number"
                        className={`score-input ${errores.puntuacion ? "error-input" : ""}`}
                        placeholder="0"
                        min="1"
                        value={puntuacionTotal}
                        onChange={handleChange(setPuntuacionTotal, "puntuacionTotal")}
                    />
                </label>
                {errores.puntuacion && <p className="error-message">{errores.puntuacion}</p>}
            </div>
        </div>
    );
};

export default FormHeader;
