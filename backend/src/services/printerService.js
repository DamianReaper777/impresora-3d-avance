import { Printer } from "../models/printerModel.js";

import {
  getSimulatedPrinters,
  getSimulatedPrinterById
} from "../simulators/printerSimulator.js";

import {
  startNextJob,
  pauseCurrentJob,
  stopCurrentJob,
  synchronizePrinterJobs
} from "./printJobService.js";

export async function getAllPrinters() {
  const printers = getSimulatedPrinters();

  const results = [];

  for (const printer of printers) {
    const updated = await synchronizePrinterJobs(
      printer.id
    );

    results.push(new Printer(updated).toJSON());
  }

  return results;
}

export async function getPrinterById(id) {
  const updated = await synchronizePrinterJobs(id);

  return updated
    ? new Printer(updated).toJSON()
    : null;
}

export async function startPrint(id) {
  return startNextJob(id);
}

export async function pausePrint(id) {
  return pauseCurrentJob(id);
}

export async function stopPrint(id) {
  return stopCurrentJob(id);
}