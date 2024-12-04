import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import "../../../css/auth/forgotPassword.css";

function ResetPassword() {
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Captura el token y el email desde los parámetros de consulta
    const query = new URLSearchParams(useLocation().search);
    const token = query.get("token");
    const email = query.get("email");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        // Revisa los datos que se están enviando
        console.log({
            token,
            email,
            password,
            password_confirmation: passwordConfirmation,
        });

        try {
            const response = await axios.post(
                "http://localhost:8000/reset-password",
                {
                    token,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            setMessage(response.data.message); // Mensaje de éxito
        } catch (err) {
            console.error("Error detallado:", err.response); // Muestra toda la respuesta del error
            setError(
                err.response?.data?.message ||
                    "No se pudo restablecer la contraseña. Inténtalo de nuevo."
            );
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-box">
                <h2>Restablecer Contraseña</h2>

                <div className="divider"></div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirmar contraseña"
                        value={passwordConfirmation}
                        onChange={(e) =>
                            setPasswordConfirmation(e.target.value)
                        }
                        required
                    />
                    <button type="submit">Restablecer contraseña</button>
                </form>

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}

                <Link to="/login" className="back-to-login">
                    Volver al Inicio de Sesión
                </Link>
            </div>
        </div>
    );
}

export default ResetPassword;
