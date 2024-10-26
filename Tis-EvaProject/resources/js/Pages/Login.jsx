import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../css/Login.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
    const [role, setRole] = useState("Docente");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            // Obtener el token CSRF desde el meta tag
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                .getAttribute("content");

            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({ email, password, role }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error en la respuesta del servidor");
            }

            const data = await response.json();
            console.log("Login exitoso:", data);

            // Almacena los datos de sesión en localStorage
            if (data.role === "Docente") {
                localStorage.setItem("ID_DOCENTE", data.id);  // Guarda el ID del docente
                localStorage.setItem("ROLE", "Docente");
                navigate("/proyectos");
            } else if (data.role === "Estudiante") {
                localStorage.setItem("ID_ESTUDIANTE", data.id);  // Guarda el ID del estudiante
                localStorage.setItem("ROLE", "Estudiante");
                navigate("/planificacion-estudiante");
            }
        } catch (error) {
            console.error("Error:", error.message);
            // Aquí puedes manejar el error y mostrar un mensaje al usuario
        }
    };

    return (
        <div
            className="app-background"
            style={{ backgroundImage: `url('/assets/Background.png')` }}
        >
            <div className="login-container">
                <h2>Iniciar Sesión</h2>
                <div className="divider"></div>
                <form onSubmit={handleLogin}>
                    <div className="input-group" style={{ position: "relative" }}>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="select-role"
                        >
                            <option value="Docente">Docente</option>
                            <option value="Estudiante">Estudiante</option>
                        </select>
                        <span
                            className="toggle-select"
                            onClick={() => document.querySelector(".select-role").click()}
                        >
                            <i className="fas fa-chevron-down"></i>
                        </span>
                    </div>

                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Correo:"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group" style={{ position: "relative" }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña:"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span
                            className="toggle-password"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? (
                                <i className="fas fa-eye-slash"></i>
                            ) : (
                                <i className="fas fa-eye"></i>
                            )}
                        </span>
                    </div>
                    <button type="submit">Iniciar Sesión</button>
                </form>

                <div className="extra-links">
                    <Link to="/forgot-password">¿Has olvidado la contraseña?</Link>
                    <Link to="/register">¿No tienes cuenta?</Link>
                </div>
                <div className="divider"></div>
                <div className="google-login">
                    <img src="/assets/LogoGoogle.png" alt="Google logo" />
                    <span>Continuar con Google</span>
                </div>
            </div>
        </div>
    );
}

export default App;