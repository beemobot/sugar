import Koa from "koa";
import helmet from "koa-helmet";
import bodyParser from "koa-bodyparser";
import { HOOK_PORT } from "./config.json";
import hookRoute from "./hook/route";
import notFoundHandler from "./middlewares/notFoundHandler";

var app = new Koa();
const port = HOOK_PORT;

app.use(helmet());
app.use(bodyParser());
app.use(notFoundHandler);

app.use(hookRoute.routes());

app.listen(HOOK_PORT, () => {
  console.log(`Server running on port ${port}`);
});
