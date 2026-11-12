import {
  getJobsByPrinter,
  createPrintJob
} from "../services/printJobService.js";

export async function listPrintJobs(req, res) {
  try {
    const result = await getJobsByPrinter(
      req.params.printerId
    );

    if (result.error === "PRINTER_NOT_FOUND") {
      return res.status(404).json({
        message: "Impresora no encontrada."
      });
    }

    res.status(200).json(result.jobs);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "No se pudo consultar la cola."
    });
  }
}

export async function createPrintJobController(req, res) {
  try {
    const result = await createPrintJob(req.body);

    const errors = {
      PRINTER_NOT_FOUND: [404, "Impresora no encontrada."],
      MODEL_NOT_FOUND: [404, "Modelo no encontrado."],
      INVALID_SETTINGS: [400, "Configuración inválida."]
    };

    if (result.error) {
      const [status, message] = errors[result.error];

      return res.status(status).json({ message });
    }

    res.status(201).json(result.job);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "No se pudo crear el trabajo."
    });
  }
}