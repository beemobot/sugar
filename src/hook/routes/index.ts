import { Router } from "express";
import hookRoutes from "./hook";

const router = Router();

router.use(hookRoutes);

export default router;
