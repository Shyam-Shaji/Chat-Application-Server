import { Router } from "express";
import healthRouters from "./healthRoutes";
import authRoutes from "./authRoutes";
const router = Router();

router.use("/", healthRouters);
router.use("/auth", authRoutes);

export default router;
