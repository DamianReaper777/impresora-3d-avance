import { Router } from "express";

import {
  uploadModelController,
  listModelsController,
  downloadModelController
} from "../controllers/modelController.js";

import { uploadModel } from "../middleware/uploadMiddleware.js";

const router = Router();

router.get("/", listModelsController);

router.get("/:id/file", downloadModelController);

router.post(
  "/",
  uploadModel.single("model"),
  uploadModelController
);

export default router;