import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

export async function register(req, res) {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ message: "Nombre, correo y contraseña son obligatorios." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
    }

    const existe = db.prepare("SELECT id FROM usuarios WHERE correo = ?").get(correo);
    if (existe) {
      return res.status(409).json({ message: "Ese correo ya está registrado." });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = db
      .prepare("INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)")
      .run(nombre, correo, hash);

    res.status(201).json({ id: Number(result.lastInsertRowid), nombre, correo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor." });
  }
}

export async function login(req, res) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios." });
    }

    const usuario = db.prepare("SELECT * FROM usuarios WHERE correo = ?").get(correo);

    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos." });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });;
  }
}
