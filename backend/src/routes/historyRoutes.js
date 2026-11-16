import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { listHistory, createHistory } from "../controllers/historyController.js";

const router = Router();

router.use(authMiddleware);
router.get("/", listHistory);
router.post("/", createHistory);

export default router;
