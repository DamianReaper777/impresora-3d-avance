import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PrinterControlPanel from "../components/PrinterControlPanel/PrinterControlPanel";
import ModelUploader from "../components/ModelUploader/ModelUploader";
import ModelViewer from "../components/ModelViewer/ModelViewer";
import ModelLibrary from "../components/ModelLibrary/ModelLibrary";

import PrintSettings from "../components/PrintSettings/PrintSettings";

import PrintQueue from "../components/PrintQueue/PrintQueue";

import {
  createPrintJob,
  getPrintJobs
} from "../services/printJobService";

import {
  getPrinterById,
  startPrint,
  pausePrint,
  stopPrint
} from "../services/printerService";

import {
  uploadModel,
  getModels,
  getModelFile
} from "../services/modelService";

import { usePrinterPolling } from "../hooks/usePrinterPolling";

import "./PrinterDetailsPage.css";

const STATUS_LABELS = {
  online: "En línea",
  printing: "Imprimiendo",
  paused: "Pausada",
  offline: "Fuera de línea"
};

function PrinterDetailsPage() {
  const { id } = useParams();

  const [printer, setPrinter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modelError, setModelError] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [creatingJob, setCreatingJob] = useState(false);
  const [jobError, setJobError] = useState(null);

  const [printSettings, setPrintSettings] = useState({
  nozzleTemperature: 200,
  bedTemperature: 60,
  printSpeed: 60,
  layerHeight: 0.2,
  infill: 20
});

  useEffect(() => {
  let active = true;

  async function loadJobs() {
    setJobsLoading(true);

    try {
      const data = await getPrintJobs(id);

      if (active) {
        setJobs(data);
      }
    } catch {
      if (active) {
        setJobError("No se pudo cargar la cola.");
      }
    } finally {
      if (active) {
        setJobsLoading(false);
      }
    }
  }

  loadJobs();

  return () => {
    active = false;
  };
}, [id]);

  useEffect(() => {
    let active = true;

    async function loadPrinter() {
      setLoading(true);
      setError(null);
      setPrinter(null);

      try {
        const data = await getPrinterById(id);

        if (active) {
          setPrinter(data);
        }
      } catch {
        if (active) {
          setError("No se pudo obtener la impresora.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPrinter();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;

    async function loadModels() {
      setModelsLoading(true);

      try {
        const data = await getModels();

        if (active) {
          setModels(data);
        }
      } catch {
        if (active) {
          setModelError("No se pudo cargar la biblioteca.");
        }
      } finally {
        if (active) {
          setModelsLoading(false);
        }
      }
    }

    loadModels();

    return () => {
      active = false;
    };
  }, []);

  const handlePrinterUpdate = useCallback(
  (updatedPrinter) => {
    setPrinter(updatedPrinter);

    getPrintJobs(id)
      .then(setJobs)
      .catch((error) => {
        console.error(
          "Error al actualizar la cola:",
          error
        );
      });
  },
  [id]
);

  usePrinterPolling(
    id,
    !loading && !busy && printer !== null,
    handlePrinterUpdate
  );

async function handleAction(action) {
  if (busy) return;

  setBusy(true);
  setError(null);

  try {
    const updatedPrinter = await action(id);

    setPrinter(updatedPrinter);

    // Actualizar la cola después de la operación.
    const updatedJobs = await getPrintJobs(id);

    setJobs(updatedJobs);
  } catch (error) {
    console.error("Error al controlar impresora:", error);

    setError(
      error.message || "No se pudo realizar la operación."
    );
  } finally {
    setBusy(false);
  }
}

  async function handleModelSelect(model) {
    setModelError(null);

    try {
      const blob = await getModelFile(model.id);

      const file = new File(
        [blob],
        model.name,
        { type: "model/stl" }
      );

      setSelectedModelId(model.id);
      setSelectedFile(file);
    } catch {
      setModelError("No se pudo abrir el modelo.");
    }
  }

  async function handleFileUpload(file) {
    if (uploading) return;

    setUploading(true);
    setModelError(null);

    try {
      const savedModel = await uploadModel(file);

      const updatedModels = await getModels();

      setModels(updatedModels);
      setSelectedModelId(savedModel.id);
      setSelectedFile(file);
    } catch (error) {
      setModelError(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="printer-details-page">
      <Link
        to="/"
        className="printer-details-page__back"
      >
        Volver a impresoras
      </Link>

      {loading && (
        <p className="printer-details-page__message">
          Cargando impresora...
        </p>
      )}

      {error && (
        <p
          className="printer-details-page__error"
          role="alert"
        >
          {error}
        </p>
      )}

      {!loading && printer && (
        <>
          <section className="printer-details-page__content">
            <header className="printer-details-page__header">
              <h1 className="printer-details-page__title">
                {printer.name}
              </h1>

              <span className="printer-details-page__status">
                {STATUS_LABELS[printer.status] ?? "Desconocido"}
              </span>
            </header>

            <div className="printer-details-page__information">
              <h2 className="printer-details-page__subtitle">
                Información de la impresora
              </h2>

              <p className="printer-details-page__field">
                <strong>Dirección IP:</strong> {printer.ip}
              </p>

              <p className="printer-details-page__field">
                <strong>Estado:</strong>{" "}
                {STATUS_LABELS[printer.status] ?? "Desconocido"}
              </p>
            </div>
          </section>

          <div className="printer-details-page__workspace">
            <ModelViewer file={selectedFile} />

            <ModelUploader
              onFileSelect={handleFileUpload}
            />
          </div>

          {uploading && (
            <p className="printer-details-page__message">
              Guardando archivo en el servidor...
            </p>
          )}

          {modelError && (
            <p
              className="printer-details-page__error"
              role="alert"
            >
              {modelError}
            </p>
          )}

          <ModelLibrary
            models={models}
            selectedModelId={selectedModelId}
            onSelect={handleModelSelect}
            loading={modelsLoading}
          />

          <PrintSettings
  settings={printSettings}
  onChange={setPrintSettings}
  disabled={busy}
/>

<div className="printer-details-page__job-actions">
  <button
    type="button"
    className="printer-details-page__create-job"
    onClick={handleCreateJob}
    disabled={!selectedModelId || creatingJob}
  >
    {creatingJob
      ? "Agregando trabajo..."
      : "Agregar a la cola"}
  </button>
</div>

{jobError && (
  <p
    className="printer-details-page__error"
    role="alert"
  >
    {jobError}
  </p>
)}

<PrintQueue
  jobs={jobs}
  loading={jobsLoading}
/>

          <PrinterControlPanel
            printer={printer}
            busy={busy}
            onStart={() => handleAction(startPrint)}
            onPause={() => handleAction(pausePrint)}
            onStop={() => handleAction(stopPrint)}
          />
        </>
      )}
    </main>
  );

  async function handleCreateJob() {
  if (!selectedModelId || creatingJob) {
    return;
  }

  setCreatingJob(true);
  setJobError(null);

  try {
    await createPrintJob({
      printerId: id,
      modelId: selectedModelId,
      settings: printSettings
    });

    const updatedJobs = await getPrintJobs(id);

    setJobs(updatedJobs);
  } catch (error) {
    setJobError(error.message);
  } finally {
    setCreatingJob(false);
  }
}

}

export default PrinterDetailsPage;