import React from 'react';
import { useNavigate } from 'react-router-dom';

const Inicio = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        navigate('/'); // Redirigir al login
      } else {
        console.error('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor');
    }
  };

  return (
    <div>
      <h1>Este es el Inicio</h1>
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
};

export default Inicio;