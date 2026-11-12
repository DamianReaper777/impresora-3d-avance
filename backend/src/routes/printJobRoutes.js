import { Router } from "express";

import {
  listPrintJobs,
  createPrintJobController
} from "../controllers/printJobController.js";

const router = Router();

router.get("/printer/:printerId", listPrintJobs);

router.post("/", createPrintJobController);

export default router;