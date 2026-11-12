const PRINT_DURATION_SECONDS = 60;

const printers = [
  {
    id: "printer-001",
    name: "ATOM IV",
    ip: "192.168.1.120",
    status: "online",
    progress: 0,
    remainingSeconds: 0
  },
  {
    id: "printer-002",
    name: "Impresora 3D B",
    ip: "192.168.1.121",
    status: "online",
    progress: 0,
    remainingSeconds: 0
  },
  {
    id: "printer-003",
    name: "Impresora 3D C",
    ip: "192.168.1.122",
    status: "offline",
    progress: 0,
    remainingSeconds: 0
  }
];

const sessions = new Map();

function findPrinter(id) {
  return printers.find((printer) => printer.id === id);
}

function copyPrinter(printer) {
  return printer ? { ...printer } : null;
}

export function getSimulatedPrinters() {
  return printers.map(copyPrinter);
}

export function getSimulatedPrinterById(id) {
  return copyPrinter(findPrinter(id));
}

export function updateSimulatedPrinter(id, changes) {
  const printer = findPrinter(id);

  if (!printer) return null;

  Object.assign(printer, changes);

  return copyPrinter(printer);
}

export function startSimulatedPrint(id) {
  const printer = findPrinter(id);

  if (!printer || printer.status !== "online") {
    return null;
  }

  sessions.set(id, {
    startedAt: Date.now(),
    elapsedBeforePause: 0
  });

  printer.status = "printing";
  printer.progress = 0;
  printer.remainingSeconds = PRINT_DURATION_SECONDS;

  return copyPrinter(printer);
}

export function pauseSimulatedPrint(id) {
  const printer = findPrinter(id);
  const session = sessions.get(id);

  if (!printer || !session || printer.status !== "printing") {
    return null;
  }

  session.elapsedBeforePause +=
    (Date.now() - session.startedAt) / 1000;

  printer.status = "paused";

  return copyPrinter(printer);
}

export function resumeSimulatedPrint(id) {
  const printer = findPrinter(id);
  const session = sessions.get(id);

  if (!printer || !session || printer.status !== "paused") {
    return null;
  }

  session.startedAt = Date.now();
  printer.status = "printing";

  return copyPrinter(printer);
}

export function stopSimulatedPrint(id) {
  const printer = findPrinter(id);

  if (!printer) return null;

  sessions.delete(id);

  printer.status = "online";
  printer.progress = 0;
  printer.remainingSeconds = 0;

  return copyPrinter(printer);
}

export function synchronizeSimulatedPrint(id) {
  const printer = findPrinter(id);
  const session = sessions.get(id);

  if (!printer || !session) {
    return {
      printer: copyPrinter(printer),
      completed: false
    };
  }

  let elapsed = session.elapsedBeforePause;

  if (printer.status === "printing") {
    elapsed +=
      (Date.now() - session.startedAt) / 1000;
  }

  console.log("SIMULACIÓN:", {
  printerId: id,
  startedAt: session.startedAt,
  elapsedBeforePause: session.elapsedBeforePause,
  elapsed,
  duration: PRINT_DURATION_SECONDS
});

  printer.progress = Math.min(
    100,
    Math.floor(
      (elapsed / PRINT_DURATION_SECONDS) * 100
    )
  );

  printer.remainingSeconds = Math.max(
    0,
    Math.ceil(PRINT_DURATION_SECONDS - elapsed)
  );

  if (elapsed >= PRINT_DURATION_SECONDS) {
    sessions.delete(id);

    printer.status = "online";
    printer.progress = 100;
    printer.remainingSeconds = 0;

    return {
      printer: copyPrinter(printer),
      completed: true
    };
  }

  return {
    printer: copyPrinter(printer),
    completed: false
  };
}