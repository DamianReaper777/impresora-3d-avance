import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";

import printerRoutes from "./routes/printerRoutes.js";
import modelRoutes from "./routes/modelRoutes.js";
import printJobRoutes from "./routes/printJobRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

app.use("/api/printers", printerRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/jobs", printJobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message: error.code === "LIMIT_FILE_SIZE"
        ? "El archivo supera el límite de 50 MB."
        : error.message
    });
  }

  if (error) {
    return res.status(400).json({
      message: error.message || "Solicitud inválida."
    });
  }

  next();
});

export default app;