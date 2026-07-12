import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import logger from "./config/logger";
import pool, { checkDatabaseConnection } from "./config/db";
import transporter from "./config/mailer";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW();");
    res.json({ status: "ok", time: result.rows[0].now });
  } catch (err) {
    logger.error("Health check failed", err);
        res.status(500).json({ status: "error" });
    }
});

const startServer = async () => {
    await checkDatabaseConnection();

    app.listen(PORT, () => {
        logger.info(`Server running on http://localhost:${PORT}`);
    });
};

startServer();

export { app, pool, transporter };
