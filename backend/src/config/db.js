import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dir = path.resolve("data");
fs.mkdirSync(dir, { recursive: true });

const db = new Database(path.join(dir, "app.db"));
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS historial_impresiones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    modelo TEXT NOT NULL,
    impresora TEXT,
    estado TEXT NOT NULL DEFAULT 'en_proceso'
      CHECK (estado IN ('en_proceso','completada','fallida')),
    duracion_min INTEGER,
    fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );
`);

export default db;
