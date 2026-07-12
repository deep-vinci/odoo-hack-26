import "dotenv/config";
import nodemailer from "nodemailer";
import logger from "./logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    logger.warn("Mail transporter verification failed — check SMTP credentials");
  } else {
    logger.info("Mail transporter is ready");
  }
});

export default transporter;
