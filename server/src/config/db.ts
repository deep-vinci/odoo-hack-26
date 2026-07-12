import "dotenv/config";
import { Pool } from "pg";
import logger from "./logger";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  logger.error("Unexpected PostgreSQL error", err);
  process.exit(1);
});

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await pool.query("SELECT 1");
    logger.info("Database connected");
    return true;
  } catch (err) {
    logger.error("Database not connected", err);
    return false;
  }
};

export default pool;
