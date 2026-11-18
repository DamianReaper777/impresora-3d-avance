import { Router } from "express";

const router = Router();

let ultimo = {
  estado: "sin_datos",
  progreso: 0,
  ultimoPulso: null
};

router.post("/pulse", (req, res) => {
  const clave = req.headers["x-device-key"];

  if (!process.env.DEVICE_KEY || clave !== process.env.DEVICE_KEY) {
    return res.status(401).json({ message: "Dispositivo no autorizado." });
  }

  const { estado, progreso } = req.body;

  ultimo = {
    estado: estado || "imprimiendo",
    progreso: Number(progreso) || 0,
    ultimoPulso: Date.now()
  };

  console.log("PULSO ESP32:", ultimo);
  res.json({ ok: true });
});

router.get("/status", (req, res) => {
  const conectado =
    ultimo.ultimoPulso !== null && Date.now() - ultimo.ultimoPulso < 10000;

  res.json({ ...ultimo, conectado });
});

export default router;