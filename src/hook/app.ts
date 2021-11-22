import express from "express";
import helmet from "helmet";
import lastUpdate from "../objects/lastUpdate";
import { HOOK_PORT } from "../config.json";

const app = express();
const port = 3030;

app.use(helmet());
app.post("/hook", (req, res, next) => {
    setTimeout(() => {
        const webhookUrl = req.url;
        console.log("Test: " + webhookUrl);
    }, 1000);

    lastUpdate.update();
    res.status(200).send("OK");
});

app.listen(HOOK_PORT, () => {
    console.log(`Hook listening on http://localhost:${port}`);
});
