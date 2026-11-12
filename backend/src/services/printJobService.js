import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import { PrintJob } from "../models/printJobModel.js";
import { getStoredModelById } from "./modelService.js";

import {
  getSimulatedPrinterById,
  startSimulatedPrint,
  pauseSimulatedPrint,
  resumeSimulatedPrint,
  stopSimulatedPrint,
  synchronizeSimulatedPrint
} from "../simulators/printerSimulator.js";

const currentDir = path.dirname(
  fileURLToPath(import.meta.url)
);

const JOBS_FILE = path.resolve(
  currentDir,
  "../../storage/jobs.json"
);

let operationQueue = Promise.resolve();

function serializeOperation(operation) {
  const result = operationQueue.then(operation);

  operationQueue = result.catch(() => {});

  return result;
}

async function readJobs() {
  try {
    const content = await fs.readFile(JOBS_FILE, "utf8");
    const jobs = JSON.parse(content);

    if (!Array.isArray(jobs)) {
      throw new Error("El archivo de trabajos no es válido.");
    }

    return jobs;
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writeJobs(jobs) {
  await fs.mkdir(path.dirname(JOBS_FILE), {
    recursive: true
  });

  const temporaryFile = `${JOBS_FILE}.tmp`;

  await fs.writeFile(
    temporaryFile,
    JSON.stringify(jobs, null, 2),
    "utf8"
  );

  await fs.rename(temporaryFile, JOBS_FILE);
}

function validateSettings(settings) {
  if (
    !settings ||
    typeof settings !== "object" ||
    Array.isArray(settings)
  ) {
    return false;
  }

  const limits = {
    nozzleTemperature: [0, 300],
    bedTemperature: [0, 120],
    printSpeed: [10, 150],
    layerHeight: [0.05, 0.4],
    infill: [0, 100]
  };

  return Object.entries(limits).every(
    ([key, [min, max]]) => {
      const value = settings[key];

      return (
        typeof value === "number" &&
        Number.isFinite(value) &&
        value >= min &&
        value <= max
      );
    }
  );
}

function findActiveJob(jobs, printerId) {
  return jobs.find(
    (job) =>
      job.printerId === printerId &&
      ["printing", "paused"].includes(job.status)
  );
}

function findNextJob(jobs, printerId) {
  return jobs.find(
    (job) =>
      job.printerId === printerId &&
      job.status === "pending"
  );
}

async function synchronizeJobs(jobs, printerId) {
  const activeJob = findActiveJob(jobs, printerId);

  if (!activeJob) {
    return false;
  }

  const result = synchronizeSimulatedPrint(printerId);

  // Recuperar trabajos que quedaron activos
  // después de reiniciar el servidor.
  if (
    result.printer?.status === "online" &&
    !result.completed
  ) {
    activeJob.status = "interrupted";

    return true;
  }

  if (!result.completed) {
    return false;
  }

  activeJob.status = "completed";
  activeJob.completedAt = new Date().toISOString();

  const nextJob = findNextJob(jobs, printerId);

  if (nextJob) {
    const started = startSimulatedPrint(printerId);

    if (started) {
      nextJob.status = "printing";
      nextJob.startedAt = new Date().toISOString();
    }
  }

  return true;
}

export async function getJobsByPrinter(printerId) {
  return serializeOperation(async () => {
    const printer = getSimulatedPrinterById(printerId);

    if (!printer) {
      return { error: "PRINTER_NOT_FOUND" };
    }

    const jobs = await readJobs();
    const changed = await synchronizeJobs(jobs, printerId);

    if (changed) {
      await writeJobs(jobs);
    }

    return {
      jobs: jobs.filter(
        (job) => job.printerId === printerId
      )
    };
  });
}

export async function createPrintJob(data) {
  const { printerId, modelId, settings } = data ?? {};

  const printer = getSimulatedPrinterById(printerId);

  if (!printer) {
    return { error: "PRINTER_NOT_FOUND" };
  }

  const model = await getStoredModelById(modelId);

  if (!model) {
    return { error: "MODEL_NOT_FOUND" };
  }

  if (!validateSettings(settings)) {
    return { error: "INVALID_SETTINGS" };
  }

  return serializeOperation(async () => {
    const jobs = await readJobs();

    const job = new PrintJob({
      id: randomUUID(),
      printerId,
      modelId,
      modelName: model.name,
      settings: { ...settings },
      status: "pending",
      createdAt: new Date().toISOString()
    });

    jobs.push(job.toJSON());

    await writeJobs(jobs);

    return { job: job.toJSON() };
  });
}

export async function startNextJob(printerId) {
  return serializeOperation(async () => {
    const printer = getSimulatedPrinterById(printerId);

    if (!printer) {
      return { error: "PRINTER_NOT_FOUND" };
    }

    const jobs = await readJobs();
    const changed = await synchronizeJobs(jobs, printerId);

    if (changed) {
      await writeJobs(jobs);
    }

    const currentPrinter =
      getSimulatedPrinterById(printerId);

    if (currentPrinter.status === "offline") {
      return { error: "PRINTER_OFFLINE" };
    }

    const activeJob = findActiveJob(jobs, printerId);

    if (activeJob?.status === "paused") {
      const resumed = resumeSimulatedPrint(printerId);

      if (!resumed) {
        return { error: "INVALID_STATE" };
      }

      activeJob.status = "printing";
      await writeJobs(jobs);

      return { printer: resumed, job: activeJob };
    }

    if (activeJob) {
      return { error: "ALREADY_PRINTING" };
    }

    if (currentPrinter.status !== "online") {
      return { error: "INVALID_STATE" };
    }

    const nextJob = findNextJob(jobs, printerId);

    if (!nextJob) {
      return { error: "EMPTY_QUEUE" };
    }

    const started = startSimulatedPrint(printerId);

    if (!started) {
      return { error: "INVALID_STATE" };
    }

    nextJob.status = "printing";
    nextJob.startedAt = new Date().toISOString();

    await writeJobs(jobs);

    return { printer: started, job: nextJob };
  });
}

export async function pauseCurrentJob(printerId) {
  return serializeOperation(async () => {
    const jobs = await readJobs();

    const changed = await synchronizeJobs(jobs, printerId);

    if (changed) {
      await writeJobs(jobs);
    }

    const activeJob = findActiveJob(jobs, printerId);

    if (!activeJob || activeJob.status !== "printing") {
      return { error: "INVALID_STATE" };
    }

    const paused = pauseSimulatedPrint(printerId);

    if (!paused) {
      return { error: "INVALID_STATE" };
    }

    activeJob.status = "paused";
    await writeJobs(jobs);

    return { printer: paused, job: activeJob };
  });
}

export async function stopCurrentJob(printerId) {
  return serializeOperation(async () => {
    const jobs = await readJobs();

    const changed = await synchronizeJobs(jobs, printerId);

    if (changed) {
      await writeJobs(jobs);
    }

    const activeJob = findActiveJob(jobs, printerId);

    if (!activeJob) {
      return { error: "INVALID_STATE" };
    }

    const stopped = stopSimulatedPrint(printerId);

    activeJob.status = "cancelled";
    activeJob.completedAt = new Date().toISOString();

    await writeJobs(jobs);

    // Detener cancela el trabajo actual.
    // No inicia automáticamente el siguiente.
    return { printer: stopped, job: activeJob };
  });
}

export async function synchronizePrinterJobs(printerId) {
  return serializeOperation(async () => {
    const printer = getSimulatedPrinterById(printerId);

    if (!printer) {
      return null;
    }

    const jobs = await readJobs();
    const changed = await synchronizeJobs(jobs, printerId);

    if (changed) {
      await writeJobs(jobs);
    }

    return getSimulatedPrinterById(printerId);
  });
}