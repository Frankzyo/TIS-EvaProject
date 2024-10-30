import React, { useEffect, useState } from 'react';
import '../../css/ApproveAccounts.css'; // Importa el nuevo CSS
import HeaderProyecto from "../Components/HeaderProyecto"; // Asegúrate de que el path es correcto
import axios from 'axios';

const ApproveAccounts = () => {
    const [pendingUsers, setPendingUsers] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/pending-users')
            .then(response => setPendingUsers(response.data))
            .catch(error => console.error(error));
    }, []);

    const handleApprove = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:8000/api/approve-user/${userId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert(response.data.message);
            setPendingUsers(pendingUsers.filter(user => user.ID_DOCENTE !== userId));
        } catch (error) {
            console.error(error);
            alert("Error al aprobar el usuario.");
        }
    };

    return (
        <div className="approve-accounts">
            <HeaderProyecto isModalOpen={false} />
            <div className="container">
                <h2 className="title">Usuarios Pendientes de Aprobación</h2>
                <div className="user-list">
                    {pendingUsers.length > 0 ? (
                        pendingUsers.map(user => (
                            <div key={user.ID_DOCENTE} className="user-item">
                                <div className="user-icon">
                                    <i className="fas fa-user-clock"></i>
                                </div>
                                <div className="user-info">
                                    <h3>{user.NOMBRE_DOCENTE} {user.APELLIDO_DOCENTE}</h3>
                                    <p>{user.EMAIL_DOCENTE}</p>
                                </div>
                                <button className="approve-button" onClick={() => handleApprove(user.ID_DOCENTE)}>Aprobar</button>
                            </div>
                        ))
                    ) : (
                        <p className="no-users">No hay usuarios pendientes de aprobación.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApproveAccounts;
