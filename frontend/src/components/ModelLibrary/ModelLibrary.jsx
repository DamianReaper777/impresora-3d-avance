import "./ModelLibrary.css";

function ModelLibrary({
  models,
  selectedModelId,
  onSelect,
  loading = false
}) {
  return (
    <section className="model-library">
      <h2 className="model-library__title">
        Biblioteca de modelos
      </h2>

      {loading && (
        <p className="model-library__message">
          Cargando modelos...
        </p>
      )}

      {!loading && models.length === 0 && (
        <p className="model-library__message">
          Todavía no hay modelos almacenados.
        </p>
      )}

      <div className="model-library__list">
        {models.map((model) => (
          <button
            key={model.id}
            type="button"
            className={`model-library__item ${
              selectedModelId === model.id
                ? "model-library__item--selected"
                : ""
            }`}
            onClick={() => onSelect(model)}
          >
            <span className="model-library__name">
              {model.name}
            </span>

            <span className="model-library__size">
              {(model.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default ModelLibrary;