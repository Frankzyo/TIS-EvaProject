import React, { useState } from 'react';
import "../../styles/Proyecto.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Proyecto = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCreateSuccessMessage, setShowCreateSuccessMessage] = useState(false);
  const [showEditSuccessMessage, setShowEditSuccessMessage] = useState(false);
  const [showDeleteSuccessMessage, setShowDeleteSuccessMessage] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projects, setProjects] = useState([]);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [projectToEdit, setProjectToEdit] = useState(null); // Estado para el proyecto a editar
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState(null); // Estado para la imagen seleccionada
  const isModalOpen = showModal || showConfirmModal || showCreateSuccessMessage || showEditSuccessMessage || showDeleteSuccessMessage; // Añadido los mensajes de éxito

  // Función para guardar o editar un proyecto
  const handleSaveProject = () => {
    if (isEditing) {
      const updatedProjects = projects.map((project, index) =>
        index === projectToEdit ? { name: projectName, description: projectDescription, image: image } : project
      );
      setProjects(updatedProjects);
      setIsEditing(false);
      setProjectToEdit(null);
      setShowEditSuccessMessage(true);
    } else {
      const newProject = { name: projectName, description: projectDescription, image: image };
      setProjects([...projects, newProject]);
      setShowCreateSuccessMessage(true);
    }
    setShowModal(false);
    setProjectName('');
    setProjectDescription('');
    setImage(null); // Limpiar el estado de la imagen después de guardar
  };

  // Función para abrir el modal de edición de un proyecto
  const handleOpenEditModal = (index) => {
    const project = projects[index];
    setProjectName(project.name);
    setProjectDescription(project.description);
    setProjectToEdit(index); // Guardar el índice del proyecto a editar
    setIsEditing(true);
    setShowModal(true);
  };

  const handleOpenConfirmModal = (index) => {
    setProjectToDelete(index);
    setShowConfirmModal(true);
  };

  const handleDeleteProject = () => {
    const updatedProjects = projects.filter((_, index) => index !== projectToDelete);
    setProjects(updatedProjects);
    setShowConfirmModal(false);
    setProjectToDelete(null);
    setShowDeleteSuccessMessage(true); // Muestra el mensaje de éxito de eliminación
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (file && validTypes.includes(file.type)) {
      setImage(file); // Guardar el archivo seleccionado en el estado
    } else {
      alert('Solo se permiten archivos de imagen en formato JPG, JPEG o PNG.');
    }
  };

  return (
    <div>
      <div className={`header ${isModalOpen ? 'disabled' : ''}`}>
        <div className="logo"></div>
        <div className="user-icon-container">
          <i className="fas fa-user-circle user-icon"></i>
          <i className="fas fa-chevron-down dropdown-icon"></i>
        </div>
      </div>

      <div className={`container ${isModalOpen ? 'disabled' : ''}`}>
        <div className="projects-header">
          <h2>Mis proyectos</h2>
          <button
            className="new-project-btn"
            onClick={() => {
              setIsEditing(false);
              setShowModal(true);
              setProjectName('');
              setProjectDescription('');
              setImage(null);
            }}
            disabled={isModalOpen}
          >
            <i className="fas fa-plus"></i> Nuevo proyecto
          </button>
        </div>

        <div className="project-list">
          {projects.map((project, index) => (
            <div key={index} className="project-item">
              <img src="https://via.placeholder.com/50" alt="Icono del proyecto" />
              <div className="project-info">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </div>
              <div className="project-actions">
                <button className="action-btn" onClick={() => handleOpenEditModal(index)}>
                  <i className="fas fa-pen"></i>
                </button>
                <button className="action-btn" onClick={() => handleOpenConfirmModal(index)}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{isEditing ? 'Editar Proyecto' : 'Detalles del Proyecto'}</h3>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Nombre del Proyecto"
              className="input-field"
            />
            <div className="description-and-photo">
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Descripción del proyecto"
                className="textarea-field"
              />
              <div className="upload-container">
                <p className="upload-title">Incluya una foto</p>
                <div className="upload-box" onClick={() => document.getElementById('fileInput').click()}>
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p>pulse aquí para añadir archivos</p>
                </div>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/jpeg, image/png, image/jpg" // Solo permite estos tipos de archivos
                  style={{ display: 'none' }}
                  onChange={handleImageChange} // Maneja el cambio del archivo
                />
                {/* Mostrar la previsualización de la imagen si hay una seleccionada */}
                {image && <p>{image.name}</p>}
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)} className="cancel-btn">
                Cancelar
              </button>
              <button onClick={handleSaveProject} className="create-btn">
                {isEditing ? 'Guardar cambios' : 'Crear proyecto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="confirm-modal">
          <div className="confirm-modal-content">
            <h3>Confirmar eliminación</h3>
            <p>¿Está seguro de que desea eliminar este proyecto?</p>
            <div className="confirm-modal-actions">
              <button onClick={() => setShowConfirmModal(false)} className="cancel-btn">
                Cancelar
              </button>
              <button onClick={handleDeleteProject} className="delete-btn">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateSuccessMessage && (
        <div className="success-modal">
          <div className="success-modal-content">
            <h3>Mensaje</h3>
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <p>¡Se creó el proyecto exitosamente!</p>
            </div>
            <button onClick={() => setShowCreateSuccessMessage(false)} className="create-btn">
              Aceptar
            </button>
          </div>
        </div>
      )}

      {showEditSuccessMessage && (
        <div className="success-modal">
          <div className="success-modal-content">
            <h3>Mensaje</h3>
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <p>¡Se guardaron los cambios exitosamente!</p>
            </div>
            <button onClick={() => setShowEditSuccessMessage(false)} className="create-btn">
              Aceptar
            </button>
          </div>
        </div>
      )}

      {showDeleteSuccessMessage && (
        <div className="success-modal">
          <div className="success-modal-content">
            <h3>Mensaje</h3>
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <p>¡Se eliminó el proyecto correctamente!</p>
            </div>
            <button onClick={() => setShowDeleteSuccessMessage(false)} className="create-btn">
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proyecto;
