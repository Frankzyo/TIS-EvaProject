import React, { useEffect, useState } from "react";
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa";
import { TbBrandX } from "react-icons/tb";
import "../../../css/HomePage/HomePage.css";
import axios from "axios";

const DEFAULT_PROFILE_PICTURE = "https://via.placeholder.com/50";

const HomePage = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [foto, setFoto] = useState(DEFAULT_PROFILE_PICTURE);

    useEffect(() => {
        const fetchUserFoto = async () => {
            const token = localStorage.getItem("authToken");

            if (!token) {
                console.warn("No token found in localStorage");
                return;
            }

            try {
                const { data } = await axios.get(
                    "http://localhost:8000/api/getLoggedUser",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                const fotoUrl = data.foto
                    ? `http://localhost:8000/storage/${data.foto}`
                    : DEFAULT_PROFILE_PICTURE;

                setFoto(fotoUrl);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Error fetching user photo:", error);
                setIsAuthenticated(false);
            }
        };

        fetchUserFoto();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setFoto(DEFAULT_PROFILE_PICTURE);
    };

    const renderUserIcon = () =>
        isAuthenticated ? (
            <img src={foto} alt="Foto de perfil" className="profile-pic" />
        ) : (
            <i className="fas fa-user-circle"></i>
        );

    const renderAuthButton = () =>
        isAuthenticated ? (
            <button onClick={handleLogout} className="btn-primary">
                Cerrar sesión
            </button>
        ) : (
            <a href="/login" className="btn-primary">
                Iniciar sesión
            </a>
        );

    const socialLinks = [
        { href: "https://instagram.com", icon: <FaInstagram /> },
        { href: "https://facebook.com", icon: <FaFacebook /> },
        { href: "https://linkedin.com", icon: <FaLinkedin /> },
        { href: "https://x.com", icon: <TbBrandX /> },
        { href: "https://youtube.com", icon: <FaYoutube /> },
    ];

    return (
        <div className="homepage-container">
            {/* Header */}
            <header className="header-homepage">
                <h1 className="title">Sistema de Evaluación de Proyectos</h1>
                <div className="homepage-user-icon">{renderUserIcon()}</div>
            </header>

            {/* Navigation Menu */}
            <nav className="nav-menu">
                <a href="/register">Registrarse</a>
                <a href="/faq">Preguntas Frecuentes</a>
                <a href="/about">Quienes Somos</a>
            </nav>

            {/* Main Content */}
            <main className="main-content">
                <h2>
                    Optimiza la Evaluación y Gestión en Proyectos del Taller de
                    Ingeniería de Software.
                </h2>
                <p>
                    Un sistema integral para el registro, planificación y
                    evaluación de equipos en entornos colaborativos, basado en
                    la metodología SCRUM.
                </p>
                {renderAuthButton()}
            </main>

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
                        {socialLinks.map(({ href, icon }, index) => (
                            <a
                                key={index}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {icon}
                            </a>
                        ))}
                    </div>
                </div>
                <div className="footer-right">
                    <a href="/privacy">Política de privacidad</a>
                    <a href="/terms">Términos</a>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
