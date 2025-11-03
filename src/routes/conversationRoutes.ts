import { Router } from "express";
import { ConversationController } from "../controllers/ConversationController";
import { AuthMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const controller = new ConversationController();

// router.get("/", AuthMiddleware.authenticate, controller.getUserConversations);

router.get(
  "/",
  AuthMiddleware.authenticate,
  controller.getMyConversations.bind(controller)
);
router.post(
  "/group",
  AuthMiddleware.authenticate,
  controller.createGroup.bind(controller)
);
router.post(
  "/:id/participants",
  AuthMiddleware.authenticate,
  controller.addParticipant.bind(controller)
);

export default router;
