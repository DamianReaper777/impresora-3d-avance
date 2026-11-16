import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { request } from "../services/api.js";

const ESTADOS = {
  en_proceso: "En proceso",
  completada: "Completada",
  fallida: "Fallida"
};

export default function HistoryPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recargar, setRecargar] = useState(0);
  const [form, setForm] = useState({
    modelo: "",
    impresora: "",
    estado: "en_proceso",
    duracion_min: ""
  });

  useEffect(() => {
    async function cargar() {
      try {
        const data = await request("/history", { token });
        setItems(data);
        setError("");
      } catch (err) {
        if (err.message.includes("Token")) {
          logout();
          navigate("/login");
          return;
        }
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [token, recargar, logout, navigate]);

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function guardar(e) {
    e.preventDefault();
    setError("");
    try {
      await request("/history", {
        method: "POST",
        token,
        body: {
          modelo: form.modelo,
          impresora: form.impresora,
          estado: form.estado,
          duracion_min: form.duracion_min ? Number(form.duracion_min) : null
        }
      });
      setForm({ modelo: "", impresora: "", estado: "en_proceso", duracion_min: "" });
      setRecargar((n) => n + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <h2>Historial de impresiones</h2>

      <form className="auth-inline-form" onSubmit={guardar}>
        <input name="modelo" placeholder="Modelo (ej. Engrane.stl)" value={form.modelo} onChange={cambiar} required />
        <input name="impresora" placeholder="Impresora" value={form.impresora} onChange={cambiar} />
        <select name="estado" value={form.estado} onChange={cambiar}>
          {Object.entries(ESTADOS).map(([valor, texto]) => (
            <option key={valor} value={valor}>{texto}</option>
          ))}
        </select>
        <input name="duracion_min" type="number" min="0" placeholder="Minutos" value={form.duracion_min} onChange={cambiar} />
        <button type="submit">Agregar</button>
      </form>

      {error && <p className="auth-error">{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <p>Aún no hay impresiones registradas.</p>
      ) : (
        <div className="auth-table-wrap">
          <table className="auth-table">
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Impresora</th>
                <th>Estado</th>
                <th>Duración</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.modelo}</td>
                  <td>{item.impresora || "-"}</td>
                  <td>{ESTADOS[item.estado] || item.estado}</td>
                  <td>{item.duracion_min ? `${item.duracion_min} min` : "-"}</td>
                  <td>{new Date(item.fecha_inicio.replace(" ", "T") + "Z").toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}