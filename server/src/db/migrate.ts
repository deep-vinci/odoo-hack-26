import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

import pool from "../config/db";
import logger from "../config/logger";

const SCHEMA_DIR = path.join(__dirname, "schema");

const migrate = async (): Promise<void> => {
  const files = fs
    .readdirSync(SCHEMA_DIR)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    logger.warn("No schema files found — nothing to migrate");
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const file of files) {
      const sql = fs.readFileSync(path.join(SCHEMA_DIR, file), "utf8");
      logger.info(`Applying ${file}`);
      await client.query(sql);
    }
    await client.query("COMMIT");
    logger.info(`Migration complete — applied ${files.length} file(s)`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

migrate()
  .then(() => pool.end())
  .catch(async (err) => {
    logger.error("Migration failed", err);
    await pool.end();
    process.exit(1);
  });
