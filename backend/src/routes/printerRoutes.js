import { Router } from "express";

import {
  listPrinters,
  getPrinter,
  startPrinter,
  pausePrinter,
  stopPrinter
} from "../controllers/printerController.js";

const router = Router();

router.get("/", listPrinters);
router.get("/:id", getPrinter);

router.post("/:id/start", startPrinter);
router.post("/:id/pause", pausePrinter);
router.post("/:id/stop", stopPrinter);

export default router;