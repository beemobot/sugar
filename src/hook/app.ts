import express from "express";
import helmet from "helmet";
import lastUpdate from "../objects/lastUpdate";
import { HOOK_PORT } from "../config.json";
import { processHook } from "./processHook";

const app = express();
const port = 3030;


// import redis from "redis";
// import RateLimiterRedis from "rate-limiter-flexible";

// Protection code from: https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example#login-endpoint-protection
// const redisClient = redis.createClient({
//   enable_offline_queue: false,
// });

// const maxWrongAttemptsByIPperDay = 100;
// const maxConsecutiveFailsByUsernameAndIP = 10;

// const limiterSlowBruteByIP = new RateLimiterRedis({
//   storeClient: redisClient,
//   keyPrefix: "login_fail_ip_per_day",
//   points: maxWrongAttemptsByIPperDay,
//   duration: 60 * 60 * 24,
//   blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
// });

// const limiterConsecutiveFailsByUsernameAndIP = new RateLimiterRedis({
//   storeClient: redisClient,
//   keyPrefix: "login_fail_consecutive_username_and_ip",
//   points: maxConsecutiveFailsByUsernameAndIP,
//   duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
//   blockDuration: 60 * 60, // Block for 1 hour
// });

// const getUsernameIPkey = (username, ip) => `${username}_${ip}`;

// async function loginRoute(req, res) {
//   const ipAddr = req.ip;
//   const usernameIPkey = getUsernameIPkey(req.body.email, ipAddr);

//   const [resUsernameAndIP, resSlowByIP] = await Promise.all([
//     limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
//     limiterSlowBruteByIP.get(ipAddr),
//   ]);

//   let retrySecs = 0;

//   // Check if IP or Username + IP is already blocked
//   if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay) {
//     retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
//   } else if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP) {
//     retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
//   }

//   if (retrySecs > 0) {
//     res.set("Retry-After", String(retrySecs));
//     res.status(429).send("Too Many Requests");
//   } else {
//     const user = authorise(req.body.email, req.body.password); // should be implemented in your project
//     if (!user.isLoggedIn) {
//       // Consume 1 point from limiters on wrong attempt and block if limits reached
//       try {
//         const promises = [limiterSlowBruteByIP.consume(ipAddr)];
//         if (user.exists) {
//           // Count failed attempts by Username + IP only for registered users
//           promises.push(limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey));
//         }

//         await Promise.all(promises);

//         res.status(400).end("email or password is wrong");
//       } catch (rlRejected) {
//         if (rlRejected instanceof Error) {
//           throw rlRejected;
//         } else {
//           res.set("Retry-After", String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
//           res.status(429).send("Too Many Requests");
//         }
//       }
//     }

//     if (user.isLoggedIn) {
//       if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
//         // Reset on successful authorisation
//         await limiterConsecutiveFailsByUsernameAndIP.delete(usernameIPkey);
//       }

//       res.end("authorized");
//     }
//   }
// }

app.use(helmet());
app.post("/hook", (req, res, next) => {
    processHook(req, res, next).then(() => {
        lastUpdate.update();
        res.status(200).send("OK");
    }).catch(err => {
        console.error(err);
        res.status(500).send("ERROR");
    });
});

app.listen(HOOK_PORT, () => {
    console.log(`Hook listening on http://localhost:${port}`);
});
