import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../css/auth/Register.css";

// Constantes para valores predeterminados y configuraciones
const DEFAULT_ROLE = "estudiante";
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

const Register = () => {
    const navigate = useNavigate();
    const [uiState, setUiState] = useState({
        showPassword: false,
        showConfirmPassword: false,
        previewImage: null,
    });

    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        photo: null,
        role: DEFAULT_ROLE,
        acceptPrivacyPolicy: false,
        receiveNotifications: false,
    });

    // Gestión de cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === "file") {
            handlePhotoChange(files[0]);
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    // Gestión de la foto de perfil
    const handlePhotoChange = (file) => {
        if (file && ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            setFormData((prev) => ({ ...prev, photo: file }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setUiState((prev) => ({
                    ...prev,
                    previewImage: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        } else {
            alert(
                "Por favor, selecciona un archivo de imagen válido (jpg, png, gif)."
            );
        }
    };

    // Alternancia de visibilidad de contraseñas
    const togglePasswordVisibility = (field) => {
        setUiState((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    // Preparación de datos para envío
    const prepareSubmissionData = () => {
        const submissionData = new FormData();
        const mappings = {
            name: "nombre",
            lastName: "apellido",
            email: "email",
            password: "password",
            confirmPassword: "password_confirmation",
            role: "role",
        };

        Object.entries(mappings).forEach(([key, apiKey]) => {
            submissionData.append(apiKey, formData[key]);
        });

        if (formData.photo) {
            submissionData.append("foto", formData.photo);
        }

        return submissionData;
    };

    // Manejo del envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const submissionData = prepareSubmissionData();
            const response = await axios.post(
                "http://localhost:8000/api/register",
                submissionData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            alert(response.data.message);
            navigate("/login");
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Error en el registro";
            console.error(error);
            alert(errorMessage);
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Registrar Cuenta</h2>

                <div className="googler-login">
                    <img src="/assets/LogoGoogle.png" alt="Google logo" />
                    <span>Iniciar sesión con Google</span>
                </div>

                <div className="divider"></div>

                <form onSubmit={handleSubmit}>
                    {/* Selector de rol */}
                    <div className="input-group">
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="docente">Docente</option>
                            <option value="estudiante">Estudiante</option>
                        </select>
                        <span className="toggle-select">
                            <i className="fas fa-chevron-down"></i>
                        </span>
                    </div>

                    {/* Campos de entrada reutilizables */}
                    {[
                        { name: "name", placeholder: "Nombre*" },
                        { name: "lastName", placeholder: "Apellidos*" },
                        {
                            name: "email",
                            placeholder: "Introduce tu correo electrónico*",
                            type: "email",
                        },
                    ].map(({ name, placeholder, type = "text" }) => (
                        <div key={name} className="input-group">
                            <input
                                type={type}
                                name={name}
                                placeholder={placeholder}
                                required
                                value={formData[name]}
                                onChange={handleInputChange}
                            />
                        </div>
                    ))}

                    {/* Campos de contraseña con toggle de visibilidad */}
                    {[
                        { name: "password", placeholder: "Contraseña*" },
                        {
                            name: "confirmPassword",
                            placeholder: "Repetir contraseña*",
                        },
                    ].map(({ name, placeholder }) => (
                        <div key={name} className="input-group">
                            <input
                                type={
                                    uiState[
                                        `show${
                                            name.charAt(0).toUpperCase() +
                                            name.slice(1)
                                        }`
                                    ]
                                        ? "text"
                                        : "password"
                                }
                                name={name}
                                placeholder={placeholder}
                                required
                                value={formData[name]}
                                onChange={handleInputChange}
                            />
                            <span
                                className="toggle-password"
                                onClick={() =>
                                    togglePasswordVisibility(
                                        `show${
                                            name.charAt(0).toUpperCase() +
                                            name.slice(1)
                                        }`
                                    )
                                }
                            >
                                <i
                                    className={`fas ${
                                        uiState[
                                            `show${
                                                name.charAt(0).toUpperCase() +
                                                name.slice(1)
                                            }`
                                        ]
                                            ? "fa-eye"
                                            : "fa-eye-slash"
                                    }`}
                                ></i>
                            </span>
                        </div>
                    ))}

                    {/* Subida de foto */}
                    <div className="uploadr-title-container">
                        <p>Incluya una foto</p>
                    </div>

                    <div className="uploadr-box-container">
                        <div
                            className="uploadr-box"
                            onClick={() =>
                                document.getElementById("photoInput").click()
                            }
                        >
                            {uiState.previewImage ? (
                                <img
                                    src={uiState.previewImage}
                                    alt="Vista previa"
                                    className="preview-image"
                                />
                            ) : (
                                <>
                                    <i className="fas fa-cloud-upload-alt"></i>
                                    <p>Pulsa aquí para añadir archivos</p>
                                </>
                            )}
                            <input
                                type="file"
                                id="photoInput"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="acceptPrivacyPolicy"
                                checked={formData.acceptPrivacyPolicy}
                                onChange={handleInputChange}
                                required
                            />
                            He leído y acepto la{" "}
                            <a
                                href="/privacy"
                                target="_blank"
                                className="privacy-link"
                            >
                                política de privacidad
                            </a>
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="receiveNotifications"
                                checked={formData.receiveNotifications}
                                onChange={handleInputChange}
                            />
                            Recibir notificaciones, novedades y tendencias por
                            correo
                        </label>
                    </div>

                    <button className="create-account-button" type="submit">
                        Registrarse
                    </button>
                </form>

                <Link to="/login" className="back-to-login">
                    Volver al Inicio de Sesión
                </Link>
            </div>
        </div>
    );
};

export default Register;
