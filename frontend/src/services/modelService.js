const API_URL = "http://localhost:3000/api/models";

async function parseResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Ocurrió un error."
    );
  }

  return data;
}

export async function uploadModel(file) {
  const formData = new FormData();

  formData.append("model", file);

  const response = await fetch(API_URL, {
    method: "POST",
    body: formData
  });

  return parseResponse(response);
}

export async function getModels() {
  const response = await fetch(API_URL);

  return parseResponse(response);
}

export async function getModelFile(id) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(id)}/file`
  );

  if (!response.ok) {
    throw new Error("No se pudo descargar el modelo.");
  }

  return response.blob();
}