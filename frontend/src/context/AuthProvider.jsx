import { useState } from "react";
import { AuthContext } from "./useAuth.js";
import { request } from "../services/api.js";

function leerSesion() {
  try {
    return JSON.parse(localStorage.getItem("sesion")) || { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
}

export default function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);

  async function login(correo, password) {
    const data = await request("/auth/login", {
      method: "POST",
      body: { correo, password }
    });
    localStorage.setItem("sesion", JSON.stringify(data));
    setSesion(data);
  }

  async function register(nombre, correo, password) {
    await request("/auth/register", {
      method: "POST",
      body: { nombre, correo, password }
    });
    await login(correo, password);
  }

  function logout() {
    localStorage.removeItem("sesion");
    setSesion({ token: null, user: null });
  }

  return (
    <AuthContext.Provider value={{ ...sesion, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}