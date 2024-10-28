import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/forgotPassword.css';

function ForgotPassword() {
  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2>Recuperar Contraseña</h2>

        <div className="divider"></div> {/* Línea divisoria */}
        
        <form>
          <input 
            type="email" 
            placeholder="Correo electrónico*" 
            required 
          />
          <button type="submit">Enviar</button>
        </form>

        <Link to="/login" className="back-to-login">
          Volver al Inicio de Sesión
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
