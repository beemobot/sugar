import express from "express";
import helmet from "helmet";
import { HOOK_PORT } from "./config.json";
import hookRoutes from "./hook/routes";
import errorHandler from "./middlewares/errorHandler";
import notFoundHandler from "./middlewares/notFoundHandler";

const app = express();
const port = HOOK_PORT;

app.use(helmet());
app.use(express.json());
app.set("trust proxy", true);

app.use("/", hookRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(HOOK_PORT, () => {
  console.log(`Hook listening on port ${port}`);
});
