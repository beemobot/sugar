import express from "express";
import lastUpdate from "../objects/lastUpdate";

const app = express();
const port = 3030;

app.post("/hook", (req, res, next) => {
    setTimeout(() => {
        const webhookUrl = req.url;
        console.log("Test: " + webhookUrl);
    }, 1000);

    lastUpdate.update();
    res.status(200).send("OK");
});

app.listen(port, () => {
    console.log(`Hook listening on http://localhost:${port}`);
});
