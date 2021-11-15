import { Pool } from "pg";
import { DB_CONNECTION_STRING } from "./config.json";

export default new Pool ({
    max: 20,
    connectionString: DB_CONNECTION_STRING,
    idleTimeoutMillis: 30000
});