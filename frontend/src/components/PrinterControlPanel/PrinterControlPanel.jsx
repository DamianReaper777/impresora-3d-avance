import "./PrinterControlPanel.css";

function formatTime(seconds) {
  const totalSeconds = Math.max(
    0,
    Math.floor(seconds ?? 0)
  );

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function PrinterControlPanel({
  printer,
  onStart,
  onPause,
  onStop,
  busy = false
}) {
  const isPrinting = printer.status === "printing";
  const isPaused = printer.status === "paused";
  const isOnline = printer.status === "online";

  const canStart = isOnline || isPaused;
  const canPause = isPrinting;
  const canStop = isPrinting || isPaused;

  return (
    <section className="printer-control-panel">
      <h2 className="printer-control-panel__title">
        Control de impresión
      </h2>

      <div className="printer-control-panel__progress">
        <div
          className="printer-control-panel__progress-bar"
          role="progressbar"
          aria-label="Progreso de impresión"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={printer.progress}
        >
          <div
            className="printer-control-panel__progress-fill"
            style={{ width: `${printer.progress}%` }}
          />
        </div>

        <span className="printer-control-panel__percentage">
          {printer.progress}%
        </span>
      </div>

    <div className="printer-control-panel__time">
  <span className="printer-control-panel__time-label">
    Tiempo restante estimado:
  </span>

  <strong className="printer-control-panel__time-value">
    {formatTime(printer.remainingSeconds)}
  </strong>
</div>

      <div className="printer-control-panel__actions">
        <button
          type="button"
          className="printer-control-panel__button printer-control-panel__button--start"
          onClick={onStart}
          disabled={!canStart || busy}
        >
          {isPaused ? "Reanudar" : "Iniciar"}
        </button>

        <button
          type="button"
          className="printer-control-panel__button printer-control-panel__button--pause"
          onClick={onPause}
          disabled={!canPause || busy}
        >
          Pausar
        </button>

        <button
          type="button"
          className="printer-control-panel__button printer-control-panel__button--stop"
          onClick={onStop}
          disabled={!canStop || busy}
        >
          Detener
        </button>
      </div>
    </section>
  );
}

export default PrinterControlPanel;