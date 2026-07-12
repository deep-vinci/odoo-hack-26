import "dotenv/config";
import { Pool } from "pg";
import logger from "./logger";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  logger.info("Connected to PostgreSQL");
});

pool.on("error", (err) => {
  logger.error("Unexpected PostgreSQL error", err);
  process.exit(1);
});

export default pool;
