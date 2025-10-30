import { Router } from "express";
import healthRouters from "./healthRoutes";
import authRoutes from "./authRoutes";
import profileRoutes from "./profileRoutes";
import messageRoutes from "./messageRoutes";
import conversationRoutes from "./conversationRoutes";
const router = Router();

router.use("/", healthRouters);
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/messages", messageRoutes);
router.use("/conversation", conversationRoutes);

export default router;
