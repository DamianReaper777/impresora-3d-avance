import { useEffect } from "react";

import { getPrinterById } from "../services/printerService";

export function usePrinterPolling(
  printerId,
  enabled,
  onUpdate
) {
  useEffect(() => {
    if (!printerId || !enabled) {
      return;
    }

    let active = true;
    let timeoutId;

    async function poll() {
      try {
        const updatedPrinter = await getPrinterById(
          printerId
        );

        if (active) {
          onUpdate(updatedPrinter);
        }
      } catch (error) {
        console.error(
          "Error al actualizar la impresora:",
          error
        );
      } finally {
        if (active) {
          timeoutId = setTimeout(poll, 1000);
        }
      }
    }

    poll();

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [printerId, enabled, onUpdate]);
}