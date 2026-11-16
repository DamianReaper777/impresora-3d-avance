import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await register(nombre, correo, password);
      navigate("/historial");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Crear cuenta</h2>
      <form onSubmit={enviar}>
        <label>Nombre</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />

        <label>Correo</label>
        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />

        <label>Contraseña (mínimo 6 caracteres)</label>
        <input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? "Creando..." : "Registrarme"}
        </button>
      </form>
      <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </div>
  );
}