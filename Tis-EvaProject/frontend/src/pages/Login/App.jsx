import React, { useState } from 'react';
import Background from '../../assets/Background.jpg';  // Imagen de fondo
import GoogleLogo from '../../assets/LogoGoogle.png';  // Logo de Google
import '../../styles/App.css';  // Importa el archivo CSS correctamente

function App() {
  const [role, setRole] = useState('Docente');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event) => {
    event.preventDefault();
    console.log('Login:', { role, email, password });
  };

  return (
    <div
      className="app-background"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className="login-container">
        <h2>Inicio Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Docente">Docente</option>
              <option value="Estudiante">Estudiante</option>
            </select>
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
          <div className="input-group">
            <input
              type="password"
              placeholder="Contraseña:"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Iniciar Sesión</button>
        </form>
        <div className="extra-links">
          <a href="#">¿Has olvidado la contraseña?</a>
          <a href="#">¿No tienes cuenta? Regístrate</a>
        </div>
        <div className="google-login">
          <img src={GoogleLogo} alt="Google logo" />
          <span>Continuar con Google</span>
        </div>
      </div>
    </div>
  );
}

export default App;
