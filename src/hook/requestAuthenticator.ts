import fs from "fs";
import { Request } from "express";
import { HOOK_KEY, BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD } from "../config.json";

export const authenticateRequest = (req: Request): Promise<void> => {
    if (!canAttemptAuthentication(req)) {
        return Promise.reject(new AuthenticationError("MAX ATTEMPTS REACHED FOR " + req.ip));
    }
    if (!req.query.key || req.query.key !== HOOK_KEY) {
        onAuthenticationFailure(req);
        return Promise.reject(new AuthenticationError("INVALID KEY"));
    }
    if (req.headers.authorization && req.headers.authorization.startsWith("Basic ")) {
        const base64authorization: string = req.headers.authorization.substring("Basic ".length);
        const authorization: string[] = Buffer.from(base64authorization).toString("utf8").split(":", 2);
        const username: string = authorization[0];
        const password: string = authorization[1];
        if (username !== BASIC_AUTH_USERNAME || password !== BASIC_AUTH_PASSWORD) {
            onAuthenticationFailure(req);
            return Promise.reject(new AuthenticationError("INVALID CREDENTIALS"));
        }
        return Promise.resolve();
    } else {
        onAuthenticationFailure(req);
        return Promise.reject(new AuthenticationError("MISSING AUTHENTICATION HEADER"));
    }
};

class IpAuthData {
    private failedAttempts: number = 0;
    private firstFailedAttempt: Date = new Date();
    private isBlacklisted: boolean = false;

    public constructor(isBlocked: boolean) {
        this.failedAttempts = 3;
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
        return (this.firstFailedAttempt.getTime() + (60_000 * 60 * 48)) < new Date().getTime();
    }
}

const authCache: {[ip: string]: IpAuthData} = {};

const onAuthenticationFailure = (req: Request): void => {
    const ip: string = req.ip;
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
        fs.readFile("./blocked-ips.json", "utf8", (err, data) => {
            if (err){
                return console.log(err);
            }
            const obj: any = JSON.parse(data);
            obj[ip] = new Date().getTime();
            fs.writeFile("./blocked-ips.json", JSON.stringify(obj), "utf8", () => console.log("Blocked IP " + ip));
        });
    }
};

const canAttemptAuthentication = (req: Request): boolean => {
    const ip: string = req.ip;
    const ipAuthData = authCache[ip];
    if (ipAuthData) {
        if (ipAuthData.isBlocked()) {
            return false;
        }
        return true;
    }
    const data: string = fs.readFileSync("./blocked-ips.json", "utf8");
    const obj: any = JSON.parse(data);
    if (obj[ip]) {
        authCache[ip] = new IpAuthData(true);
        return false;
    }
    authCache[ip] = new IpAuthData(false);
    return true;
};

export class AuthenticationError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = "AuthenticationError";
    }
}
