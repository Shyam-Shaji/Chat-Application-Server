import { Container } from "inversify";
import { HealthController } from "./controllers/HealthController";
import { TYPES } from "./types/types";

const container = new Container();

container.bind<HealthController>(TYPES.HealthController).to(HealthController);

export { container };
