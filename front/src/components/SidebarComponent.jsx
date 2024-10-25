import { Navbar, Nav, Button, Offcanvas } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import './SidebarComponent.css';
import { Link, useNavigate } from 'react-router-dom';


export const SidebarComponent = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
    <div className="App d-flex">
      <div className="content flex-grow-1">
        <Navbar bg="dark" variant="dark" expand="lg">
          <Button variant="outline-light" onClick={handleShow}>
            ☰
          </Button>
          <Navbar.Brand href="#home" className="ms-3">Mi Aplicación</Navbar.Brand>
        </Navbar>

        <Offcanvas show={show} onHide={handleClose} className="bg-dark text-white" placement="start">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menú</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="flex-column">
              <Link href="#home" className="text-white">Inicio</Link>
              <Link href="#profile" className="text-white">Perfil</Link>
              <Link href="#settings" className="text-white">Configuración</Link>
              <Link href="#logout" className="text-white" onClick={handleLogout}>Cerrar Sesión</Link>
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </div>
  );
};
