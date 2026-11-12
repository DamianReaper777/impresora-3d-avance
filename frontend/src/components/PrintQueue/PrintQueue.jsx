import "./PrintQueue.css";

const STATUS_LABELS = {
  pending: "En espera",
  printing: "Imprimiendo",
  paused: "Pausado",
  completed: "Completado",
  failed: "Fallido",
  cancelled: "Cancelado"
};

function PrintQueue({ jobs, loading = false }) {
  const visibleJobs = jobs.filter(
    (job) =>
      job.status === "pending" ||
      job.status === "printing" ||
      job.status === "paused"
  );

  const pendingCount = jobs.filter(
    (job) => job.status === "pending"
  ).length;

  return (
    <section className="print-queue">
      <div className="print-queue__header">
        <h2 className="print-queue__title">
          Cola de impresión
        </h2>

        <span className="print-queue__count">
          {pendingCount}{" "}
          {pendingCount === 1 ? "pendiente" : "pendientes"}
        </span>
      </div>

      {loading && (
        <p className="print-queue__message">
          Cargando trabajos...
        </p>
      )}

      {!loading && visibleJobs.length === 0 && (
        <p className="print-queue__message">
          No hay trabajos activos ni pendientes.
        </p>
      )}

      <div className="print-queue__list">
        {visibleJobs.map((job, index) => (
          <article
            key={job.id}
            className={`print-queue__item print-queue__item--${job.status}`}
          >
            <span className="print-queue__position">
              {index + 1}
            </span>

            <div className="print-queue__information">
              <strong className="print-queue__name">
                {job.modelName}
              </strong>

              <span className="print-queue__date">
                {new Date(job.createdAt).toLocaleString()}
              </span>
            </div>

            <span
              className={`print-queue__status print-queue__status--${job.status}`}
            >
              {STATUS_LABELS[job.status] ?? "Desconocido"}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PrintQueue;