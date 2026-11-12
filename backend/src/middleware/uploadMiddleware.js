import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const MODELS_DIRECTORY = path.resolve(
  currentDir,
  "../../storage/models"
);

mkdirSync(MODELS_DIRECTORY, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, MODELS_DIRECTORY);
  },

  filename(req, file, callback) {
    const id = randomUUID();

    callback(null, `${id}.stl`);
  }
});

function fileFilter(req, file, callback) {
  const extension = path.extname(
    file.originalname
  ).toLowerCase();

  if (extension !== ".stl") {
    return callback(
      new Error("Solo se permiten archivos STL.")
    );
  }

  callback(null, true);
}

export const uploadModel = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1
  }
});