import { Router } from "express";
import healthRouters from "./healthRoutes";
import authRoutes from "./authRoutes";
import profileRoutes from "./profileRoutes";
const router = Router();

router.use("/", healthRouters);
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);

export default router;
