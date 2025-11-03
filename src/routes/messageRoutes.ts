import { Router } from "express";
import { MessageRepository } from "../repositories";
import { MessageService } from "../services";
import { MessageController } from "../controllers";
import { AuthMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const repo = new MessageRepository();
const service = new MessageService(repo);
const controller = new MessageController(service);

router.post(
  "/",
  AuthMiddleware.authenticate,
  controller.sendMessage.bind(controller)
);
router.get(
  "/:id",
  AuthMiddleware.authenticate,
  controller.getMessages.bind(controller)
);
router.patch(
  "/:id",
  AuthMiddleware.authenticate,
  controller.editMessage.bind(controller)
);
router.delete(
  "/:id",
  AuthMiddleware.authenticate,
  controller.deleteMessage.bind(controller)
);
router.post(
  "/:id/read",
  AuthMiddleware.authenticate,
  controller.markRead.bind(controller)
);

export default router;
