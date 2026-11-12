import { useRef, useState } from "react";
import "./ModelUploader.css";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function ModelUploader({ onFileSelect }) {
  const inputRef = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function validateFile(file) {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".stl")) {
      setError("Por ahora solamente se permiten archivos STL.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("El archivo no puede superar los 50 MB.");
      return;
    }

    if (file.size === 0) {
      setError("El archivo está vacío.");
      return;
    }

    setError("");
    onFileSelect(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files[0];
    validateFile(file);
  }

  function handleDragOver(event) {
    event.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setDragging(false);
  }

  function handleInputChange(event) {
    const file = event.target.files[0];

    validateFile(file);

    event.target.value = "";
  }

  return (
    <section className="model-uploader">
      <h2 className="model-uploader__title">
        Cargar modelo 3D
      </h2>

      <div
        className={`model-uploader__dropzone ${
          dragging ? "model-uploader__dropzone--dragging" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <p className="model-uploader__instruction">
          Arrastra aquí tu archivo STL
        </p>

        <p className="model-uploader__separator">
          o
        </p>

        <button
          type="button"
          className="model-uploader__button"
          onClick={() => inputRef.current?.click()}
        >
          Seleccionar archivo
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".stl"
          className="model-uploader__input"
          onChange={handleInputChange}
        />

        <p className="model-uploader__hint">
          Formato STL · Máximo 50 MB
        </p>
      </div>

      {error && (
        <p className="model-uploader__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

export default ModelUploader;