import React, { useEffect, useState } from "react";
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa";
import { TbBrandX } from "react-icons/tb";
import "../../css/HomePage.css";
import axios from "axios";

function HomePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [foto, setFoto] = useState("https://via.placeholder.com/50"); // Foto por defecto

    useEffect(() => {
        const fetchUserFoto = async () => {
            try {
                const token = localStorage.getItem("authToken");

                const response = await axios.get(
                    "http://localhost:8000/api/getLoggedUser",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                const data = response.data;
                const fotoUrl = data.foto
                    ? `http://localhost:8000/storage/${data.foto}`
                    : "https://via.placeholder.com/50";

                setFoto(fotoUrl);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Error al obtener la foto del usuario:", error);
                setIsAuthenticated(false);
            }
        };

        fetchUserFoto();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setFoto("https://via.placeholder.com/50");
    };

    return (
        <div className="homepage-container">
            {/* Header */}
            <header className="header-homepage">
                <h1 className="title">Sistema de Evaluación de Proyectos</h1>
                <div className="homepage-user-icon">
                    {isAuthenticated ? (
                        <img
                            src={foto}
                            alt="Foto de perfil"
                            className="profile-pic"
                        />
                    ) : (
                        <i className="fas fa-user-circle"></i>
                    )}
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
                <h2>
                    Optimiza la Evaluación y Gestión en Proyectos del Taller de
                    Ingeniería de Software.
                </h2>
                <p>
                    Un sistema integral para el registro, planificación y
                    evaluación de equipos en entornos colaborativos, basado en
                    la metodología SCRUM.
                </p>
                {isAuthenticated ? (
                    <button onClick={handleLogout} className="btn-primary">
                        Cerrar sesión
                    </button>
                ) : (
                    <a
                        href="/login"
                        className={`btn-primary ${
                            isAuthenticated ? "logout" : ""
                        }`}
                        onClick={isAuthenticated ? handleLogout : null}
                    >
                        {isAuthenticated ? "Cerrar sesión" : "Iniciar sesión"}
                    </a>
                )}
            </div>

            {/* Image */}
            <img
                src="/assets/ImageHome.png"
                alt="Imagen de gestión de proyectos"
                className="main-image"
            />

            {/* Footer */}
            <footer className="footer">
                <div className="footer-left">
                    <p>Contáctanos en...</p>
                    <div className="social-icons">
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaInstagram />
                        </a>
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaFacebook />
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaLinkedin />
                        </a>
                        <a
                            href="https://x.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <TbBrandX />
                        </a>
                        <a
                            href="https://youtube.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaYoutube />
                        </a>
                    </div>
                </div>
                <div className="footer-right">
                    <a href="/privacy">Política de privacidad</a>
                    <a href="/terms">Términos</a>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;
