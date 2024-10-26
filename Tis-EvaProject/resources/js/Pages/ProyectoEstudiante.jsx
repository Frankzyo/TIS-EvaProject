import React, { useState, useEffect } from 'react';
import '../../css/ProyectoEstudiante.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const ProyectoEstudiante = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const mockProjects = [
      { id: 1, title: 'Sistema de evaluación basada en proyecto', description: 'Un sistema para docentes de TIS' },
      { id: 2, title: 'Sistema de cursos', description: 'Un sistema para docentes de TIS' },
      { id: 3, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Un sistema para docentes de TIS' },
      { id: 4, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Un sistema para docentes de TIS' },
      { id: 5, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Un sistema para docentes de TIS' },
      { id: 6, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Un sistema para docentes de TIS' },
      { id: 7, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Un sistema para docentes de TIS' },
      { id: 8, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Un sistema para docentes de TIS' },
      { id: 9, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Un sistema para docentes de TIS' },
      { id: 10, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Un sistema para docentes de TIS' },
      { id: 11, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Un sistema para docentes de TIS' },
      { id: 12, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Un sistema para docentes de TIS' },
      { id: 13, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Un sistema para docentes de TIS' },
      { id: 14, title: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Un sistema para docentes de TIS' },
    ];
    setProjects(mockProjects);
  }, []);

  return (
    <div className="proyecto-estudiante">
      {/* Header */}
      <div className="header">
      <div className="logo"></div>
        <div className="user-icon-container">
          <i className="fas fa-user-circle user-icon"></i>
          <i className="fas fa-chevron-down dropdown-icon"></i>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container">
        <h2 className="title">Mis proyectos</h2>
        <div className="project-list">
          {projects.map((project) => (
            <div key={project.id} className="project-item">
              <div className="project-icon">
                <i className="fas fa-project-diagram"></i>
              </div>
              <div className="project-info">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProyectoEstudiante;
