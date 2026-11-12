const API_URL = "http://localhost:3000/api/jobs";

async function parseResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Error al procesar la solicitud."
    );
  }

  return data;
}

export async function createPrintJob(jobData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(jobData)
  });

  return parseResponse(response);
}

export async function getPrintJobs(printerId) {
  const response = await fetch(
    `${API_URL}/printer/${encodeURIComponent(printerId)}`
  );

  return parseResponse(response);
}