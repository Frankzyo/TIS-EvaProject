import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../../css/auth/Login.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ModalError from "../../Components/ComponenteModal/ModalError";

// Componente para el selector de rol
const RoleSelector = ({ role, setRole }) => (
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
);

// Componente para el campo de entrada de texto (email, contraseña)
const InputField = ({
    type,
    value,
    placeholder,
    onChange,
    toggleVisibility,
}) => (
    <div className="input-group" style={{ position: "relative" }}>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required
        />
        {toggleVisibility && (
            <span className="toggle-password" onClick={toggleVisibility}>
                {type === "password" ? (
                    <i className="fas fa-eye"></i>
                ) : (
                    <i className="fas fa-eye-slash"></i>
                )}
            </span>
        )}
    </div>
);

// Componente Login
function Login() {
    const [role, setRole] = useState("Docente");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    // Función para alternar la visibilidad de la contraseña
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    // Función para manejar el inicio de sesión
    const handleLogin = async (event) => {
        event.preventDefault();
        console.log("Datos enviados:", { email, password, role });

        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                .getAttribute("content");

            const loginUrl =
                role === "Docente" ? "/docente/login" : "/estudiante/login";
            const response = await fetch(loginUrl, {
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
                setErrorMessage(
                    errorData.error || "Error en la respuesta del servidor"
                );
                setShowError(true); // Activa el modal de error
                return;
            }

            const data = await response.json();
            console.log("Login exitoso:", data);

            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            if (data.role === "Docente") {
                localStorage.setItem("ID_DOCENTE", data.id);
                localStorage.setItem("ROLE", "Docente");
                navigate("/proyectos");
            } else if (data.role === "Estudiante") {
                localStorage.setItem("ID_EST", data.id); // Almacenar el ID como ID_EST
                localStorage.setItem("IS_RL", data.is_rl);
                localStorage.setItem("ROLE", "Estudiante");
                navigate("/planificacion-estudiante");
            }
        } catch (error) {
            console.error("Error:", error.message);
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

                {/* Formulario de login */}
                <form onSubmit={handleLogin}>
                    {/* Componente para selección de rol */}
                    <RoleSelector role={role} setRole={setRole} />

                    {/* Componente para el campo de email */}
                    <InputField
                        type="email"
                        value={email}
                        placeholder="Correo:"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* Componente para el campo de contraseña */}
                    <InputField
                        type={showPassword ? "text" : "password"}
                        value={password}
                        placeholder="Contraseña:"
                        onChange={(e) => setPassword(e.target.value)}
                        toggleVisibility={togglePasswordVisibility}
                    />

                    {/* Botón de submit */}
                    <button type="submit" className="styled-button">
                        Iniciar Sesión
                    </button>
                </form>

                {/* Enlaces adicionales */}
                <div className="extra-links">
                    <Link to="/forgot-password">
                        ¿Has olvidado la contraseña?
                    </Link>
                    <Link to="/register">¿No tienes cuenta? Regístrate</Link>
                </div>

                <div className="divider"></div>

                {/* Opción de login con Google */}
                <div className="google-login">
                    <img src="/assets/LogoGoogle.png" alt="Google logo" />
                    <span>Continuar con Google</span>
                </div>
            </div>

            {/* Modal de error */}
            {showError && (
                <ModalError
                    errorMessage={errorMessage}
                    closeModal={() => setShowError(false)}
                />
            )}
        </div>
    );
}
export default Login;
