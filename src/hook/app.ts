import express from "express";
import helmet from "helmet";
import lastUpdate from "../objects/lastUpdate";
import { HOOK_PORT } from "../config.json";
import { processHook } from "./processHook";

const app = express();
const port = 3030;

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
