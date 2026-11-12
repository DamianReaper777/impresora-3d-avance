import { useEffect, useState } from "react";

import PrinterCard from "../components/PrinterCard/PrinterCard";
import { getPrinters } from "../services/printerService";

import "./PrintersPage.css";

function PrintersPage() {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadPrinters() {
      try {
        const data = await getPrinters();

        if (active) {
          setPrinters(data);
        }
      } catch {
        if (active) {
          setError("No se pudieron cargar las impresoras.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPrinters();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="printers-page">
      <header className="printers-page__header">
        <h1 className="printers-page__title">
          Administrador de impresoras 3D
        </h1>

        <p className="printers-page__description">
          Impresoras disponibles en la red
        </p>
      </header>

      {loading && (
        <p className="printers-page__message">
          Cargando impresoras...
        </p>
      )}

      {error && (
        <p className="printers-page__error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <section className="printers-page__grid">
          {printers.length === 0 ? (
            <p className="printers-page__message">
              No hay impresoras registradas.
            </p>
          ) : (
            printers.map((printer) => (
              <PrinterCard
                key={printer.id}
                printer={printer}
              />
            ))
          )}
        </section>
      )}
    </main>
  );
}

export default PrintersPage;