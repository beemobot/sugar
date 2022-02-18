import { Next } from "koa";
import { RouterContext } from "koa-router";

const notFoundHandler = async (ctx: RouterContext, next: Next) => {
  await next();
  const status = ctx.status || 404;
  if (status === 404) {
    ctx.status = 404;
    ctx.body = {};
  }
};

export default notFoundHandler;
