import fs from "node:fs/promises";

import {
  saveModelMetadata,
  getStoredModels,
  getStoredModelById,
  getStoredModelFilePath
} from "../services/modelService.js";

function isValidSTL(buffer) {
  if (buffer.length < 84) {
    return false;
  }

  // Comprobación de STL binario.
  const triangles = buffer.readUInt32LE(80);
  const expectedSize = 84 + triangles * 50;

  if (expectedSize === buffer.length && triangles > 0) {
    return true;
  }

  // Comprobación básica de STL ASCII.
  const content = buffer.toString("utf8");

  return (
    /^\s*solid\b/i.test(content) &&
    /\bfacet\s+normal\b/i.test(content) &&
    /\bvertex\b/i.test(content) &&
    /\bendsolid\b/i.test(content)
  );
}

export async function uploadModelController(req, res) {
  if (!req.file) {
    return res.status(400).json({
      message: "Debes seleccionar un archivo STL."
    });
  }

  try {
    const buffer = await fs.readFile(req.file.path);

    if (!isValidSTL(buffer)) {
      await fs.unlink(req.file.path);

      return res.status(400).json({
        message: "El archivo no contiene un STL válido."
      });
    }

    const model = await saveModelMetadata(req.file);

    res.status(201).json(model);
  } catch (error) {
    console.error(error);

    await fs.unlink(req.file.path).catch(() => {});

    res.status(500).json({
      message: "No se pudo guardar el modelo."
    });
  }
}

export async function listModelsController(req, res) {
  try {
    const models = await getStoredModels();

    res.status(200).json(models);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "No se pudieron obtener los modelos."
    });
  }
}

export async function downloadModelController(req, res) {
  try {
    const model = await getStoredModelById(req.params.id);

    if (!model) {
      return res.status(404).json({
        message: "Modelo no encontrado."
      });
    }

    const filePath = getStoredModelFilePath(model.id);

    res.setHeader("Content-Type", "model/stl");

    res.sendFile(filePath);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "No se pudo obtener el archivo."
    });
  }
}