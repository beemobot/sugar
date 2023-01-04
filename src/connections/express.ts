import express from "express";
import expressBasicAuth from "express-basic-auth";
import GetWebhookRoute from "../routes/GetWebhookRoute";
export const server = express()

function init() {
    const username = process.env.BASIC_AUTH_USERNAME
    const password = process.env.BASIC_AUTH_PASSWORD

    if (username == null || password == null) {
        console.error('Basic authentication is not configured, discarding request to start.')
        process.exit()
        return
    }

    let account: any = {}
    account[username] = password

    if (process.env.SERVER_PORT == null) {
        console.error('Server is not configured, discarding request to start.')
        process.exit()
        return
    }

    server
        .use(express.json())
        .use((request, _, next) => {
            console.log(JSON.stringify({ method: request.method, route: request.path, ip: request.ip, data: request.body }));
            next();
        })
        .use(expressBasicAuth({ users: account }))
        .use(GetWebhookRoute)

    server.listen(process.env.SERVER_PORT, () => {
        console.log('--------------- Kimbap: Server')
        console.log('Connection: http://localhost:' + process.env.SERVER_PORT)
        console.log('--------------- ')
    })
}

export const Expresso = { init: init }