import { Link } from "react-router-dom";

import "./PrinterCard.css";

const STATUS_LABELS = {
  online: "En línea",
  printing: "Imprimiendo",
  offline: "Fuera de línea"
};

function PrinterCard({ printer }) {
  const statusLabel =
    STATUS_LABELS[printer.status] ?? "Desconocido";

  return (
    <article className="printer-card">
      <div className="printer-card__header">
        <h2 className="printer-card__name">
          {printer.name}
        </h2>

        <span
          className={
            "printer-card__status " +
            "printer-card__status--" +
            printer.status
          }
        >
          {statusLabel}
        </span>
      </div>

      <p className="printer-card__ip">
        Dirección IP: {printer.ip}
      </p>

      <Link
        to={`/printers/${printer.id}`}
        className="printer-card__link"
      >
        Ver detalles
      </Link>
    </article>
  );
}

export default PrinterCard;