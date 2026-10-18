import nodemailer from "nodemailer";

// Production SMTP helper. Keep the mail account as the actual envelope sender:
// Gmail rejects arbitrary FROM addresses unless configured as a verified alias.
const smtpHost = () => String(process.env.SMTP_HOST || "smtp.gmail.com").trim();
const smtpUser = () => String(process.env.SMTP_USER || "").trim();
const smtpPass = () => String(process.env.SMTP_APP_PASSWORD || process.env.SMTP_PASS || "").replace(/\s+/g, "");
const configuredPort = () => Number(String(process.env.SMTP_PORT || "587").trim()) || 587;

const createTransport = ({ port, secure }) => nodemailer.createTransport({
  host: smtpHost(),
  port,
  secure,
  requireTLS: !secure,
  auth: { user: smtpUser(), pass: smtpPass(), method: "LOGIN" },
  tls: {
    rejectUnauthorized: String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED || "true").toLowerCase() !== "false",
    servername: smtpHost(),
    minVersion: "TLSv1.2",
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
  family: 4,
});

let cachedTransport = null;
const transports = () => {
  const first = configuredPort();
  const candidates = [{ port: first, secure: first === 465 }];
  if (!candidates.some(x => x.port === 587)) candidates.push({ port: 587, secure: false });
  if (!candidates.some(x => x.port === 465)) candidates.push({ port: 465, secure: true });
  return candidates;
};

const getConfigured = () => Boolean(smtpHost() && smtpUser() && smtpPass());

const mailOptions = ({ to, subject, html, attachments }) => ({
  // Authenticated Gmail sender avoids 550/DMARC sender mismatch.
  from: `"${String(process.env.FROM_NAME || "Recruweb").replace(/["<>]/g, "")}" <${smtpUser()}>`,
  replyTo: process.env.FROM_EMAIL && String(process.env.FROM_EMAIL).trim() !== smtpUser() ? String(process.env.FROM_EMAIL).trim() : undefined,
  to: String(to).trim(),
  subject,
  html,
  ...(attachments ? { attachments } : {}),
});

export const send = async (payload) => {
  if (!getConfigured()) {
    const err = new Error("SMTP is not configured: SMTP_HOST, SMTP_USER and SMTP_PASS are required");
    err.code = "SMTP_NOT_CONFIGURED";
    throw err;
  }

  const options = mailOptions(payload);
  const errors = [];
  const candidates = transports();

  // Try cached successful transport first, then both standard Gmail ports.
  const attempts = cachedTransport ? [{ cached: true, transporter: cachedTransport }, ...candidates.map(c => ({ ...c }))] : candidates.map(c => ({ ...c }));
  for (const attempt of attempts) {
    try {
      const transport = attempt.cached ? attempt.transporter : createTransport(attempt);
      const info = await transport.sendMail(options);
      cachedTransport = transport;
      console.log(`[email] accepted by SMTP for ${options.to}; response=${info.response || "OK"}`);
      return info;
    } catch (error) {
      errors.push({ code: error?.code, message: error?.message, response: error?.response });
      console.error(`[email] SMTP attempt ${attempt.cached ? "cached" : attempt.port} failed`, errors[errors.length - 1]);
      if (attempt.cached) cachedTransport = null;
      // Authentication failures are credential/account failures; changing ports cannot fix them.
      if (String(error?.code || "").toUpperCase() === "EAUTH") break;
    }
  }

  const final = new Error("All SMTP delivery attempts failed");
  final.code = errors.at(-1)?.code || "SMTP_SEND_FAILED";
  final.smtpReason = final.code === "EAUTH" ? "Gmail rejected SMTP credentials. Generate a fresh 16-character Google App Password and set SMTP_APP_PASSWORD (or SMTP_PASS), then restart the backend." : undefined;
  final.smtpAttempts = errors;
  throw final;
};

const baseWrap = (title, bodyHtml) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
    <h2 style="color:#111827;">${title}</h2>${bodyHtml}
    <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Recruweb · This is an automated message.</p>
  </div>`;

export const sendVerificationEmail = async (user, rawToken) => {
  const base = (process.env.FRONTEND_URL || "https://recruweb.com").replace(/\/$/, "");
  const url = `${base}/#/verify-email/${rawToken}`;
  return send({ to: user.email, subject: "Verify your Recruweb account", html: baseWrap("Verify your email", `<p>Hi ${user.name || "there"},</p><p><a href="${url}">Verify Email</a></p><p>${url}</p>`) });
};

export const sendPasswordResetEmail = async (user, rawToken) => {
  const base = (process.env.FRONTEND_URL || "https://recruweb.com").replace(/\/$/, "");
  const url = `${base}/#/reset-password/${rawToken}`;
  return send({ to: user.email, subject: "Reset your Recruweb password", html: baseWrap("Reset your password", `<p>Hi ${user.name || "there"},</p><p>We received a request to reset your password.</p><p><a href="${url}" style="background:#5FA8D3;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">Reset Password</a></p><p>Or copy this link: ${url}</p><p>This link expires in 30 minutes.</p>`) });
};

export const sendOtpEmail = async (user, otp) => send({ to: user.email, subject: "Your Recruweb verification code", html: baseWrap("Your verification code", `<p>Hi ${user.name || "there"},</p><p style="font-size:28px;font-weight:800;letter-spacing:6px;">${otp}</p>`) });
