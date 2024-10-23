import { useNavigate } from 'react-router-dom';

const Home = () => {
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
        navigate('login'); // Redirigir al login
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

export default Home;