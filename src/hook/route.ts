import Router from "koa-router";
import { hookController } from "./controller";
import { authenticateRequest } from "./requestAuthenticator";

const router = new Router();

router.post("/hook", authenticateRequest, hookController);

export default router;
