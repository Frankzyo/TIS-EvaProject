import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../css/register.css';

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Solicitud de Cuenta</h2>

                {/* Botón de Google con estilo reutilizado */}
                <div className="googler-login">
                    <img src="/assets/LogoGoogle.png" alt="Google logo" />
                    <span>Iniciar sesión con Google</span>
                </div>

                <div className="divider"></div>

                <form>
                    <div className="input-group">
                        <input type="text" placeholder="Nombre*" required />
                    </div>

                    <div className="input-group">
                        <input type="email" placeholder="Introduce tu correo electrónico*" required />
                    </div>

                    <div className="input-group">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Contraseña*"
                            required
                        />
                        <span className="toggle-password" onClick={togglePasswordVisibility}>
                            {showPassword ? (
                                <i className="fas fa-eye-slash"></i>
                            ) : (
                                <i className="fas fa-eye"></i>
                            )}
                        </span>
                    </div>

                    <div className="input-group">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Repetir contraseña*"
                            required
                        />
                        <span className="toggle-password" onClick={toggleConfirmPasswordVisibility}>
                            {showConfirmPassword ? (
                                <i className="fas fa-eye-slash"></i>
                            ) : (
                                <i className="fas fa-eye"></i>
                            )}
                        </span>
                    </div>

                    <div className="uploadr-title-container">
                        <p>Incluya una foto</p>
                    </div>

                    <div className="uploadr-box-container">
                        <div className="uploadr-box">
                            <i className="fas fa-cloud-upload-alt"></i>
                            <p>Pulsa aquí para añadir archivos</p>
                        </div>
                    </div>

                    <div className="checkbox-group">
                        <label>
                            <input type="checkbox" required />
                            He leído y acepto la política de privacidad
                        </label>
                        <label>
                            <input type="checkbox" />
                            Recibir notificaciones, novedades y tendencias por correo
                        </label>
                    </div>

                    <button className="create-account-button">Solicitar cuenta</button>
                </form>

                <Link to="/login" className="back-to-login">
                    Volver al Inicio de Sesión
                </Link>
            </div>
        </div>
    );
}

export default Register;
