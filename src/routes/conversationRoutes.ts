import { Router } from "express";
import { ConversationController } from "../controllers/ConversationController";
import { AuthMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const controller = new ConversationController();

router.get("/", AuthMiddleware.authenticate, controller.getUserConversations);

export default router;
