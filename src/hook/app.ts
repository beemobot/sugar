import express from "express";
import helmet from "helmet";
import lastUpdate from "../objects/lastUpdate";
import { HOOK_PORT } from "../config.json";
import { authenticateRequest, AuthenticationError } from "./requestAuthenticator";
import { processRequest } from "./requestProcessor";

const app = express();
const port = 3030;

app.use(helmet());
app.use(express.json());
app.set("trust proxy", true);

app.post("/hook", (req, res, next) => {
    authenticateRequest(req)
        .then(__ => {
            console.log("Incoming request authenticated successfully");
            res.status(200).send("OK");
            processRequest(req)
                .then(___ => {
                    lastUpdate.update();
                    console.log("Request processed successfully");
                }).catch(err => {
                    console.error("Uncaught error in processing: ", err);
                });
        })
        .catch(err => {
            if (err instanceof AuthenticationError) {
                console.error("Webhook received but failed authentication: ", err);
                res.status(401).send(err.message);
            } else {
                console.error("Uncaught error in authentication: ", err);
                res.status(500).send("ERROR");
            }
        });
});

app.listen(HOOK_PORT, () => {
    console.log(`Hook listening on http://localhost:${port}`);
});
