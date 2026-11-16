import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

export default function AuthBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function salir() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="auth-bar">
      <Link to="/">Impresoras</Link>
      {user ? (
        <>
          <Link to="/historial">Historial</Link>
          <span className="auth-bar-spacer" />
          <span>Hola, {user.nombre}</span>
          <button onClick={salir}>Cerrar sesión</button>
        </>
      ) : (
        <>
          <span className="auth-bar-spacer" />
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/register">Registrarse</Link>
        </>
      )}
    </nav>
  );
}