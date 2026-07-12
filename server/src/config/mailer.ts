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
    logger.warn("Mail transporter verification failed. Check SMTP credentials");
  } else {
    logger.info("Mail transporter is ready");
  }
});

export const sendResetEmail = async (
  to: string,
  resetUrl: string,
): Promise<void> => {
  const ttl = Number(process.env.RESET_TOKEN_TTL_MIN) || 30;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: "Reset your TransitOps password",
      text: `We received a request to reset your password.\n\nReset it here: ${resetUrl}\n\nThis link expires in ${ttl} minutes. If you did not request this, you can safely ignore this email.`,
      html: `<p>We received a request to reset your password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in ${ttl} minutes. If you did not request this, you can safely ignore this email.</p>`,
    });
    logger.info(`Password reset email sent to ${to}`);
  } catch (err) {
    logger.error("Failed to send password reset email", err);
  }
};

export default transporter;
