import { Pool } from "pg";
import { DB_CONNECTION_STRING } from "../config.json";

// Initialize PG Pool
const pool: Pool = new Pool({
    max: 20,
    connectionString: DB_CONNECTION_STRING,
    idleTimeoutMillis: 30000,
});

export default pool;
