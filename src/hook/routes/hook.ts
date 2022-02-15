import { Router } from "express";
import { hookController } from "../controllers/hook";
import { authenticateRequest } from "../requestAuthenticator";

const router = Router();

router.post("/hook", authenticateRequest, hookController);

export default router;
