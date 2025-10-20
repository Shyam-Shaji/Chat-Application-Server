import { Router } from "express";
import healthRouters from "./healthRoutes";
import authRoutes from "./authRoutes";
import profileRoutes from "./profileRoutes";
import messageRoutes from "./messageRoutes";
const router = Router();

router.use("/", healthRouters);
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/messages", messageRoutes);

export default router;
