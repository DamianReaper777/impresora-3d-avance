import "./PrintSettings.css";

function PrintSettings({ settings, onChange, disabled = false }) {
  function updateSetting(event) {
    const { name, value } = event.target;

    onChange({
      ...settings,
      [name]: Number(value)
    });
  }

  return (
    <section className="print-settings">
      <h2 className="print-settings__title">
        Configuración de impresión
      </h2>

      <div className="print-settings__grid">
        <div className="print-settings__field">
          <label
            className="print-settings__label"
            htmlFor="nozzle-temperature"
          >
            Temperatura del extrusor (°C)
          </label>

          <input
            id="nozzle-temperature"
            className="print-settings__input"
            type="number"
            name="nozzleTemperature"
            min="0"
            max="300"
            step="5"
            value={settings.nozzleTemperature}
            onChange={updateSetting}
            disabled={disabled}
          />
        </div>

        <div className="print-settings__field">
          <label
            className="print-settings__label"
            htmlFor="bed-temperature"
          >
            Temperatura de la cama (°C)
          </label>

          <input
            id="bed-temperature"
            className="print-settings__input"
            type="number"
            name="bedTemperature"
            min="0"
            max="120"
            step="5"
            value={settings.bedTemperature}
            onChange={updateSetting}
            disabled={disabled}
          />
        </div>

        <div className="print-settings__field">
          <label
            className="print-settings__label"
            htmlFor="print-speed"
          >
            Velocidad de impresión (mm/s)
          </label>

          <input
            id="print-speed"
            className="print-settings__input"
            type="number"
            name="printSpeed"
            min="10"
            max="150"
            step="5"
            value={settings.printSpeed}
            onChange={updateSetting}
            disabled={disabled}
          />
        </div>

        <div className="print-settings__field">
          <label
            className="print-settings__label"
            htmlFor="layer-height"
          >
            Altura de capa (mm)
          </label>

          <input
            id="layer-height"
            className="print-settings__input"
            type="number"
            name="layerHeight"
            min="0.05"
            max="0.4"
            step="0.05"
            value={settings.layerHeight}
            onChange={updateSetting}
            disabled={disabled}
          />
        </div>

        <div className="print-settings__field">
          <label
            className="print-settings__label"
            htmlFor="infill"
          >
            Relleno (%)
          </label>

          <input
            id="infill"
            className="print-settings__input"
            type="number"
            name="infill"
            min="0"
            max="100"
            step="5"
            value={settings.infill}
            onChange={updateSetting}
            disabled={disabled}
          />
        </div>
      </div>
    </section>
  );
}

export default PrintSettings;