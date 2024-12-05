import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../../css/ForgotPassword.css';
import "../../css/Login.css"

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Docente'); // Estado para el rol
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar el botón

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true); // Deshabilita el botón cuando se envía la solicitud

    try {
      // Cambia la URL según el rol
      const url = role === 'Docente' 
        ? 'http://localhost:8000/docente/password/forgot' 
        : 'http://localhost:8000/estudiante/password/forgot';

      const response = await axios.post(
        url,
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setMessage(response.data.message); // Mensaje de éxito
    } catch (err) {
      console.error('Error de respuesta completa:', err.response); // Muestra la respuesta completa del error
      setError(err.response?.data?.message || 'No se pudo enviar el enlace de recuperación.');
    } finally {
      setIsLoading(false); // Rehabilita el botón después de completar la solicitud
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <h2>Recuperar Contraseña</h2>

        <div className="divider"></div>

        <form onSubmit={handleSubmit}>
        <div className="input-group forgot-password-input-group">
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

          <input 
            type="email" 
            placeholder="Correo electrónico*" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-messagetext">{error}</p>}

        <Link to="/login" className="back-to-login">
          Volver al Inicio de Sesión
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
