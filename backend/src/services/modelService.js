import fs from "node:fs/promises";
import path from "node:path";

import { StoredModel } from "../models/storedModel.js";
import { MODELS_DIRECTORY } from "../middleware/uploadMiddleware.js";

function getMetadataPath(id) {
  return path.join(MODELS_DIRECTORY, `${id}.json`);
}

function getFilePath(id) {
  return path.join(MODELS_DIRECTORY, `${id}.stl`);
}

function isValidId(id) {
  return /^[0-9a-f-]{36}$/i.test(id);
}

export async function saveModelMetadata(file) {
  const id = path.parse(file.filename).name;

  const model = new StoredModel({
    id,
    name: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString()
  });

  await fs.writeFile(
    getMetadataPath(id),
    JSON.stringify(model.toJSON(), null, 2),
    "utf8"
  );

  return model.toJSON();
}

export async function getStoredModels() {
  const files = await fs.readdir(MODELS_DIRECTORY);

  const metadataFiles = files.filter(
    (name) => name.endsWith(".json")
  );

  const models = [];

  for (const filename of metadataFiles) {
    try {
      const content = await fs.readFile(
        path.join(MODELS_DIRECTORY, filename),
        "utf8"
      );

      const model = JSON.parse(content);

      await fs.access(getFilePath(model.id));

      models.push(model);
    } catch (error) {
      console.error(
        `No se pudo leer ${filename}:`,
        error
      );
    }
  }

  return models.sort(
    (a, b) =>
      new Date(b.uploadedAt) - new Date(a.uploadedAt)
  );
}

export async function getStoredModelById(id) {
  if (!isValidId(id)) {
    return null;
  }

  try {
    const content = await fs.readFile(
      getMetadataPath(id),
      "utf8"
    );

    await fs.access(getFilePath(id));

    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export function getStoredModelFilePath(id) {
  if (!isValidId(id)) {
    return null;
  }

  return getFilePath(id);
}