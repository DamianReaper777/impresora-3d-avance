import {
  getAllPrinters,
  getPrinterById,
  startPrint,
  pausePrint,
  stopPrint
} from "../services/printerService.js";

const ERROR_RESPONSES = {
  PRINTER_NOT_FOUND: [404, "Impresora no encontrada."],
  PRINTER_OFFLINE: [409, "La impresora está fuera de línea."],
  EMPTY_QUEUE: [409, "No hay trabajos pendientes."],
  ALREADY_PRINTING: [409, "Ya existe una impresión en curso."],
  INVALID_STATE: [409, "La operación no es válida en el estado actual."]
};

function sendOperationResult(res, result) {
  if (result.error) {
    const [status, message] =
      ERROR_RESPONSES[result.error] ?? [
        500,
        "Error desconocido."
      ];

    return res.status(status).json({ message });
  }

  return res.status(200).json(result.printer);
}

function handleError(res, error) {
  console.error(error);

  return res.status(500).json({
    message: "Ocurrió un error en el servidor."
  });
}

export async function listPrinters(req, res) {
  try {
    const printers = await getAllPrinters();
    return res.status(200).json(printers);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getPrinter(req, res) {
  try {
    const printer = await getPrinterById(req.params.id);

    if (!printer) {
      return res.status(404).json({
        message: "Impresora no encontrada."
      });
    }

    return res.status(200).json(printer);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function startPrinter(req, res) {
  try {
    const result = await startPrint(req.params.id);
    return sendOperationResult(res, result);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function pausePrinter(req, res) {
  try {
    const result = await pausePrint(req.params.id);
    return sendOperationResult(res, result);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function stopPrinter(req, res) {
  try {
    const result = await stopPrint(req.params.id);
    return sendOperationResult(res, result);
  } catch (error) {
    return handleError(res, error);
  }
}