import React from 'react';
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from 'react-icons/fa'; // Iconos sociales
import { TbBrandX } from 'react-icons/tb'; // Icono actualizado para Twitter (X)
import '../../css/HomePage.css';

function HomePage() {
  return (
    <div className="homepage-container">
      {/* Header */}
      <header className="header-homepage">
        <h1 className="title">Sistema de Evaluación de Proyectos</h1>
        <div className="homepage-user-icon">
          <i className="fas fa-user-circle"></i>
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        <a href="/register">Registrarse</a>
        <a href="/faq">Preguntas Frecuentes</a>
        <a href="/about">Quienes Somos</a>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <h2>Optimiza la Evaluación y Gestión en Proyectos del Taller de Ingeniería de Software.</h2>
        <p>
          Un sistema integral para el registro, planificación y evaluación de
          equipos en entornos colaborativos, basado en la metodología SCRUM.
        </p>
        <a href="/login" className="btn-primary">Iniciar sesión</a>
      </div>

      {/* Image */}
      <img src="/assets/ImageHome.png" alt="Imagen de gestión de proyectos" className="main-image" />

      {/* Footer */}
      <footer className="footer">
        <div className="footer-left">
          <p>Contáctanos en...</p>
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer">
              <TbBrandX />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <FaYoutube />
            </a>
          </div>
        </div>
        <div className="footer-right">
          <a href="/privacy">política de privacidad</a>
          <a href="/terms">Términos</a>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
