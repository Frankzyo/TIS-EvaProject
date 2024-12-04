import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../../css/auth/Register.css";
import axios from "axios";
import ModalErrorRegister from "../../Components/ComponenteModal/ModalErrorRegister";

function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [errorModal, setErrorModal] = useState({
        isOpen: false,
        title: "",
        message: "",
    });

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
            reader.onloadend = () => setPreviewImage(reader.result);
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
        if (formData.photo) submissionData.append("foto", formData.photo);

        try {
            const response = await axios.post(
                "http://localhost:8000/api/register",
                submissionData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            alert(response.data.message);
            navigate("/login");
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Error en el registro. Verifica tus datos.";
            setErrorModal({
                isOpen: true,
                title: "Error de Registro",
                message: errorMessage,
            });
        }
    };
    const InputField = ({
        type,
        name,
        placeholder,
        value,
        onChange,
        required,
    }) => (
        <div className="input-group">
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
            />
        </div>
    );

    const PasswordField = ({
        name,
        placeholder,
        value,
        onChange,
        toggleVisibility,
        showPassword,
    }) => (
        <div className="input-group">
            <input
                type={showPassword ? "text" : "password"}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
            />
            <span className="toggle-password" onClick={toggleVisibility}>
                {showPassword ? (
                    <i className="fas fa-eye-slash"></i>
                ) : (
                    <i className="fas fa-eye"></i>
                )}
            </span>
        </div>
    );

    const CheckboxField = ({ name, label, checked, onChange, required }) => (
        <label>
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                required={required}
            />
            {label}
        </label>
    );

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Registrar Cuenta</h2>
                <div className="divider"></div>

                <form onSubmit={handleSubmit}>
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

                    <InputField
                        type="text"
                        name="name"
                        placeholder="Nombre*"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                    <InputField
                        type="text"
                        name="lastName"
                        placeholder="Apellidos*"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                    />
                    <InputField
                        type="email"
                        name="email"
                        placeholder="Introduce tu correo electrónico*"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />

                    <PasswordField
                        name="password"
                        placeholder="Contraseña*"
                        value={formData.password}
                        onChange={handleInputChange}
                        toggleVisibility={togglePasswordVisibility}
                        showPassword={showPassword}
                    />
                    <PasswordField
                        name="confirmPassword"
                        placeholder="Repetir contraseña*"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        toggleVisibility={toggleConfirmPasswordVisibility}
                        showPassword={showConfirmPassword}
                    />

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
                        <CheckboxField
                            name="acceptPrivacyPolicy"
                            label="He leído y acepto la política de privacidad"
                            checked={formData.acceptPrivacyPolicy}
                            onChange={handleInputChange}
                            required
                        />
                        <CheckboxField
                            name="receiveNotifications"
                            label="Recibir notificaciones, novedades y tendencias por correo"
                            checked={formData.receiveNotifications}
                            onChange={handleInputChange}
                        />
                    </div>

                    <button className="create-account-button" type="submit">
                        Registrarse
                    </button>
                </form>

                <Link to="/login" className="back-to-login">
                    Volver al Inicio de Sesión
                </Link>
            </div>

            <ModalErrorRegister
                isOpen={errorModal.isOpen}
                onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
                title={errorModal.title}
                message={errorModal.message}
            />
        </div>
    );
}

export default Register;
