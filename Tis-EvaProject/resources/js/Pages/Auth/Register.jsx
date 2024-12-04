import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../../css/auth/Register.css";
import axios from "axios";

function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        photo: null,
        role: "estudiante", // Rol por defecto
        acceptPrivacyPolicy: false,
        receiveNotifications: false,
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () =>
        setShowConfirmPassword(!showConfirmPassword);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setFormData((prevData) => ({
                ...prevData,
                photo: file,
            }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            alert(
                "Por favor, selecciona un archivo de imagen (jpg, png, gif)."
            );
            e.target.value = "";
        }
    };

    const handleClickUploadBox = () =>
        document.getElementById("photoInput").click();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submissionData = new FormData();
        submissionData.append("nombre", formData.name);
        submissionData.append("apellido", formData.lastName);
        submissionData.append("email", formData.email);
        submissionData.append("password", formData.password);
        submissionData.append(
            "password_confirmation",
            formData.confirmPassword
        );
        submissionData.append("role", formData.role);

        if (formData.photo) {
            submissionData.append("foto", formData.photo);
        }

        try {
            const response = await axios.post(
                "http://localhost:8000/api/register",
                submissionData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            alert(response.data.message);
            navigate("/login");
        } catch (error) {
            if (error.response) {
                console.error(error.response.data);
                alert(
                    "Error en el registro: " +
                        (error.response.data.message || "Verifica tus datos.")
                );
            } else {
                console.error(error);
                alert("Error en el registro.");
            }
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Registrar Cuenta</h2>

                <div className="divider"></div>

                <form onSubmit={handleSubmit}>
                    {/* Campo de selección de rol */}
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
                    </div>

                    <div className="input-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Nombre*"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Apellidos*"
                            required
                            value={formData.lastName}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Introduce tu correo electrónico*"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Contraseña*"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
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

                    <div className="input-group">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Repetir contraseña*"
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                        />
                        <span
                            className="toggle-password"
                            onClick={toggleConfirmPasswordVisibility}
                        >
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
                        <div
                            className="uploadr-box"
                            onClick={handleClickUploadBox}
                        >
                            {previewImage ? (
                                <img
                                    src={previewImage}
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
                                onChange={handlePhotoChange}
                            />
                        </div>
                    </div>

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
}

export default Register;
