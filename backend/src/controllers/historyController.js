import db from "../config/db.js";

export function listHistory(req, res) {
  try {
    const rows = db
      .prepare("SELECT * FROM historial_impresiones WHERE usuario_id = ? ORDER BY fecha_inicio DESC")
      .all(req.user.id);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor." });
  }
}

export function createHistory(req, res) {
  try {
    const { modelo, impresora, estado, duracion_min } = req.body;

    if (!modelo) {
      return res.status(400).json({ message: "El modelo es obligatorio." });
    }

    const estadosValidos = ["en_proceso", "completada", "fallida"];
    if (estado && !estadosValidos.includes(estado)) {
      return res.status(400).json({ message: "Estado inválido." });
    }

    const result = db
      .prepare(
        `INSERT INTO historial_impresiones (usuario_id, modelo, impresora, estado, duracion_min)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(req.user.id, modelo, impresora || null, estado || "en_proceso", duracion_min || null);

    res.status(201).json({ id: Number(result.lastInsertRowid) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor." });
  }
}
