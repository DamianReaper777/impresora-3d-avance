import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await login(correo, password);
      navigate("/historial");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Iniciar sesión</h2>
      <form onSubmit={enviar}>
        <label>Correo</label>
        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />

        <label>Contraseña</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
    </div>
  );
}