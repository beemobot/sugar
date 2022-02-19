import fs from "fs";
import { RequestHandler, Request } from "express";
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

export const authenticateRequest: RequestHandler = async (req, res, next) => {
  if (
    !isAllowedOrigin(req.hostname) &&
    (!req.headers["user-agent"] || req.headers["user-agent"] !== "ChargeBee")
  ) {
    console.log("requestAuthenticator error - UNEXPECTED REQUEST ORIGIN", {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      hostname: req.hostname,
    });

    res.status(401).json({ error: "UNEXPECTED REQUEST ORIGIN" });
    return;
  }
  if (!canAttemptAuthentication(req)) {
    console.log("requestAuthenticator error - MAX ATTEMPTS REACHED FOR IP", {
      ip: req.ip,
    });

    return res
      .status(401)
      .json({ error: "MAX ATTEMPTS REACHED FOR " + req.ip });
  }
  if (!req.query.key || req.query.key !== HOOK_KEY) {
    console.log("requestAuthenticator error - INVALID KEY", {
      key: req.query.key?.toString().slice(-5),
    });

    onAuthenticationFailure(req);
    return res.status(401).json({ error: "INVALID KEY" });
  }
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Basic ")
  ) {
    const base64authorization: string = req.headers.authorization.substring(
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

      onAuthenticationFailure(req);
      return res.status(401).json({ error: "INVALID CREDENTIALS" });
    }
    return next();
  } else {
    console.log("requestAuthenticator error - MISSING AUTHENTICATION HEADER", {
      authHeader: req.headers.authorization?.slice(0, 5),
    });

    onAuthenticationFailure(req);
    return res.status(401).json({ error: "MISSING AUTHENTICATION HEADER" });
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

const onAuthenticationFailure = (req: Request): void => {
  const ip: string = getIp(req);
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
    fs.readFile(`${__dirname}/blocked-ips.json`, "utf8", (err, data) => {
      if (err) {
        return console.log(err);
      }
      const obj: any = JSON.parse(data);
      obj[ip] = new Date().getTime();
      fs.writeFile(
        `${__dirname}/blocked-ips.json`,
        JSON.stringify(obj),
        "utf8",
        () => console.log("Blocked IP " + ip)
      );
    });
  }
};

const canAttemptAuthentication = (req: Request): boolean => {
  const ip: string = getIp(req);
  const ipAuthData = authCache[ip];
  if (ipAuthData) {
    if (ipAuthData.isBlocked()) {
      return false;
    }
    return true;
  }
  const data: string = fs.readFileSync(`${__dirname}/blocked-ips.json`, "utf8");
  const obj: any = JSON.parse(data);
  if (obj[ip]) {
    authCache[ip] = new IpAuthData(true);
    return false;
  }
  authCache[ip] = new IpAuthData(false);
  return true;
};

const getIp = (req: Request): string => {
  const cfIp: string | string[] | undefined = req.headers["cf-connecting-ip"];
  const ip: string = cfIp
    ? typeof cfIp === "string"
      ? cfIp
      : cfIp[0]
    : req.ip;
  return ip;
};

export class AuthenticationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}
