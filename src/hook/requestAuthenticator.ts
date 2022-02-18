import fs from "fs";
import { Context, Middleware } from "koa";
import {
  HOOK_KEY,
  BASIC_AUTH_USERNAME,
  BASIC_AUTH_PASSWORD,
  ALLOWED_ORIGIN,
} from "../config.json";

const isAllowedOrigin = (hostname: string) => {
  if (!ALLOWED_ORIGIN) return false;

  const allowedOrigins = ALLOWED_ORIGIN.split(",");
  for (const origin of allowedOrigins) {
    if (hostname === origin) return true;
  }
  return false;
};

export const authenticateRequest: Middleware = async (ctx, next) => {
  if (
    !isAllowedOrigin(ctx.hostname) &&
    (!ctx.headers["user-agent"] || ctx.headers["user-agent"] !== "ChargeBee")
  ) {
    console.log("requestAuthenticator error - UNEXPECTED REQUEST ORIGIN", {
      userAgent: ctx.headers["user-agent"],
      ip: ctx.ip,
      hostname: ctx.hostname,
    });

    ctx.status = 401;
    ctx.body = { error: "UNEXPECTED REQUEST ORIGIN" };
    return;
  }
  if (!canAttemptAuthentication(ctx)) {
    console.log("requestAuthenticator error - MAX ATTEMPTS REACHED FOR IP", {
      ip: ctx.ip,
    });

    ctx.status = 401;
    ctx.body = { error: "MAX ATTEMPTS REACHED FOR " + ctx.ip };
    return;
  }
  if (!ctx.query.key || ctx.query.key !== HOOK_KEY) {
    console.log("requestAuthenticator error - INVALID KEY", {
      key: ctx.query.key?.toString().slice(-5),
    });

    onAuthenticationFailure(ctx);
    ctx.status = 401;
    return;
  }
  if (
    ctx.headers.authorization &&
    ctx.headers.authorization.startsWith("Basic ")
  ) {
    const base64authorization: string = ctx.headers.authorization.substring(
      "Basic ".length
    );
    const authorization: string[] = Buffer.from(base64authorization, "base64")
      .toString("utf8")
      .split(":", 2);
    const username: string = authorization[0];
    const password: string = authorization[1];
    if (username !== BASIC_AUTH_USERNAME || password !== BASIC_AUTH_PASSWORD) {
      console.log("requestAuthenticator error - INVALID CREDENTIALS", {
        username,
        password: (password || "").slice(-5),
      });

      onAuthenticationFailure(ctx);
      ctx.status = 401;
      return;
    }
    return next();
  } else {
    console.log("requestAuthenticator error - MISSING AUTHENTICATION HEADER", {
      authHeader: ctx.headers.authorization?.slice(0, 5),
    });

    onAuthenticationFailure(ctx);
    ctx.status = 401;
    return;
  }
};

class IpAuthData {
  private failedAttempts: number = 0;
  private firstFailedAttempt: Date = new Date();
  private isBlacklisted: boolean = false;

  public constructor(isBlocked: boolean) {
    this.failedAttempts = isBlocked ? 4 : 0;
    this.isBlacklisted = isBlocked;
  }

  public onFailedAuthentication() {
    this.failedAttempts++;
  }

  public isBlocked(): boolean {
    return this.isBlacklisted;
  }

  public blacklistable(): boolean {
    if (this.isBlacklisted) {
      return false;
    }
    if (this.clearable()) {
      return false;
    }
    if (this.failedAttempts > 3) {
      this.isBlacklisted = true;
      return true;
    }
    return false;
  }

  public clearable(): boolean {
    return (
      this.firstFailedAttempt.getTime() + 60_000 * 60 * 48 <
      new Date().getTime()
    );
  }
}

const authCache: { [ip: string]: IpAuthData } = {};

const onAuthenticationFailure = (ctx: Context): void => {
  const ip: string = getIp(ctx);
  let ipAuthData = authCache[ip];
  if (!ipAuthData) {
    authCache[ip] = new IpAuthData(false);
    ipAuthData = authCache[ip];
  }
  ipAuthData.onFailedAuthentication();
  if (ipAuthData.clearable()) {
    delete authCache[ip];
  } else if (ipAuthData.isBlocked()) {
    return;
  } else if (ipAuthData.blacklistable()) {
    fs.readFile("./src/hook/blocked-ips.json", "utf8", (err, data) => {
      if (err) {
        return console.log(err);
      }
      const obj: any = JSON.parse(data);
      obj[ip] = new Date().getTime();
      fs.writeFile(
        "./src/hook/blocked-ips.json",
        JSON.stringify(obj),
        "utf8",
        () => console.log("Blocked IP " + ip)
      );
    });
  }
};

const canAttemptAuthentication = (ctx: Context): boolean => {
  const ip: string = getIp(ctx);
  const ipAuthData = authCache[ip];
  if (ipAuthData) {
    if (ipAuthData.isBlocked()) {
      return false;
    }
    return true;
  }
  const data: string = fs.readFileSync("./src/hook/blocked-ips.json", "utf8");
  const obj: any = JSON.parse(data);
  if (obj[ip]) {
    authCache[ip] = new IpAuthData(true);
    return false;
  }
  authCache[ip] = new IpAuthData(false);
  return true;
};

const getIp = (ctx: Context): string => {
  const cfIp: string | string[] | undefined = ctx.headers["cf-connecting-ip"];
  const ip: string = cfIp
    ? typeof cfIp === "string"
      ? cfIp
      : cfIp[0]
    : ctx.ip;
  return ip;
};

export class AuthenticationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}
