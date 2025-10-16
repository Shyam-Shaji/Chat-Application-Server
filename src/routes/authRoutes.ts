import { Router } from "express";
import { UserRepository } from "../repositories";
import { AuthService } from "../services";
import { AuthController } from "../controllers";
import { AuthMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const userRepo = new UserRepository();
const authService = new AuthService(userRepo);
const authController = new AuthController(authService);

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.post("/refresh", authController.refresh.bind(authController));
router.post(
  "/logout",
  AuthMiddleware.authenticate,
  authController.logout.bind(authController)
);

export default router;
