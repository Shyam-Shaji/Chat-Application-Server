import { Container } from "inversify";
import { HealthController } from "./controllers/HealthController";
import { TYPES } from "./types/types";
import { IUserRepository } from "./interfaces/IUserRepository";
import { UserRepository } from "./repositories/UserRepository";
import { IAuthService } from "./interfaces/IAuthService";
import { AuthService } from "./services/AuthService";
import { AuthMiddleware } from "./middlewares/authMiddleware";

const container = new Container();

container.bind<HealthController>(TYPES.HealthController).to(HealthController);

// Bind repositories
// container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);

// Bind services
// container.bind<IAuthService>(TYPES.AuthService).to(AuthService);

// Bind middleware
// container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware);

// Bind Socket.IO

// Bind JWT secret (from .env)
// container
//   .bind<string>(TYPES.JwtSecret)
//   .toConstantValue(process.env.JWT_SECRECT || "your-secret-key");

export { container };
