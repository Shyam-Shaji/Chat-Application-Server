import { Router } from "express";
import { ProfileController } from "../controllers";
import { AuthMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const controller = new ProfileController();

router.get(
  "/",
  AuthMiddleware.authenticate,
  controller.getProfile.bind(controller)
);
router.patch(
  "/",
  AuthMiddleware.authenticate,
  controller.updateProfile.bind(controller)
);
router.post(
  "/contacts",
  AuthMiddleware.authenticate,
  controller.addContact.bind(controller)
);
router.get(
  "/contacts",
  AuthMiddleware.authenticate,
  controller.getContacts.bind(controller)
);
router.get(
  "/contacts/:id",
  AuthMiddleware.authenticate,
  controller.removeContact.bind(controller)
);

export default router;
