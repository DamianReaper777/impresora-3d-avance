const API_URL = "http://localhost:3000/api/printers";

async function parseResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "No se pudo realizar la operación."
    );
  }

  return data;
}

export async function getPrinters() {
  const response = await fetch(API_URL);

  return parseResponse(response);
}

export async function getPrinterById(id) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(id)}`
  );

  return parseResponse(response);
}

export async function startPrint(id) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(id)}/start`,
    {
      method: "POST"
    }
  );

  return parseResponse(response);
}

export async function pausePrint(id) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(id)}/pause`,
    {
      method: "POST"
    }
  );

  return parseResponse(response);
}

export async function stopPrint(id) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(id)}/stop`,
    {
      method: "POST"
    }
  );

  return parseResponse(response);
}