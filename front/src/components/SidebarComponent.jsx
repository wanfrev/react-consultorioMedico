import "bootstrap/dist/css/bootstrap.min.css";
import "./SidebarComponent.css";
import { useNavigate, Link } from "react-router-dom";

export const SidebarComponent = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        navigate("/"); // Redirigir al login
      } else {
        console.error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor");
    }
  };

  return (
    <nav className="navbar navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          Medi+Linktech
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasDarkNavbar"
          aria-controls="offcanvasDarkNavbar"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className="offcanvas offcanvas-end text-bg-dark"
          id="offcanvasDarkNavbar"
          aria-labelledby="offcanvasDarkNavbarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasDarkNavbarLabel">
              Medi+Linktech
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="/home">Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="#">
                  Crear una cita
                </Link>
              </li>
            </ul>
            <form className="d-flex mt-3" role="search">
              <button
                className="btn btn-danger"
                type="submit"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
};
