import { Router } from "express";
import { container } from "../container";
import { HealthController } from "../controllers/HealthController";
import { TYPES } from "../types/types";

const router = Router();
const healthController = container.get<HealthController>(
  TYPES.HealthController
);

router.get("/", healthController.healthCheck.bind(healthController));
router.get("/db", healthController.dbCheck.bind(healthController));

export default router;
