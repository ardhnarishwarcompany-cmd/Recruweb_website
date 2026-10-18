import Razorpay from "razorpay";
import crypto from "node:crypto";

/*
 * IMPORTANT:
 * Read Razorpay environment variables at call time, not only at module import
 * time. This prevents stale credentials when dotenv/watch mode reloads modules.
 */
const getKeyId = () => String(process.env.RAZORPAY_KEY_ID || "").trim();
const getKeySecret = () => String(process.env.RAZORPAY_KEY_SECRET || "").trim();
const getWebhookSecret = () =>
  String(process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();

export function getRazorpayMode() {
  const keyId = getKeyId();
  if (keyId.startsWith("rzp_live_")) return "live";
  if (keyId.startsWith("rzp_test_")) return "test";
  return "unconfigured";
}

export function getPublicKeyId() {
  return getKeyId();
}

export function getRazorpayKeyId() {
  return getKeyId();
}

export function isRazorpayConfigured() {
  const keyId = getKeyId();
  const keySecret = getKeySecret();
  const mode = getRazorpayMode();
  return Boolean(
    keyId &&
      keySecret &&
      (mode === "test" || mode === "live") &&
      ((mode === "test" && !keyId.startsWith("rzp_live_")) ||
        (mode === "live" && !keyId.startsWith("rzp_test_"))),
  );
}

export function getRazorpayClient() {
  const keyId = getKeyId();
  const keySecret = getKeySecret();
  const mode = getRazorpayMode();

  if (!keyId || !keySecret || mode === "unconfigured") {
    const err = new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.",
    );
    err.code = "RAZORPAY_NOT_CONFIGURED";
    throw err;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

const normalizeRazorpayError = (error, fallbackMessage) => {
  const statusCode = Number(error?.statusCode || error?.status || error?.response?.status || 0);
  const gatewayCode = String(error?.error?.code || error?.code || "").toUpperCase();
  const description = String(
    error?.error?.description ||
      error?.description ||
      error?.message ||
      fallbackMessage,
  ).trim();

  const wrapped = new Error(description || fallbackMessage);
  wrapped.statusCode = statusCode || 502;
  wrapped.gatewayCode = gatewayCode;
  if (statusCode === 401 || statusCode === 403 || /AUTH|UNAUTH|INVALID.*KEY|BAD.*CREDENTIAL/i.test(description)) {
    wrapped.code = "RAZORPAY_AUTH_FAILED";
    wrapped.message =
      "Razorpay rejected the backend credentials. Use a matching RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from the same Razorpay account/mode (TEST or LIVE), then restart the backend.";
  } else {
    wrapped.code = "RAZORPAY_API_ERROR";
  }
  return wrapped;
};

export async function createRazorpayOrder({
  amount,
  amountPaise,
  currency = "INR",
  receipt,
  notes = {},
} = {}) {
  const client = getRazorpayClient();

  const paise =
    amountPaise != null
      ? Math.round(Number(amountPaise))
      : Math.round(Number(amount) * 100);

  if (!Number.isFinite(paise) || paise <= 0) {
    throw new Error("Invalid Razorpay order amount.");
  }

  const payload = {
    amount: paise,
    currency: String(currency || "INR").toUpperCase(),
    notes: notes && typeof notes === "object" ? notes : {},
  };

  if (receipt) payload.receipt = String(receipt);

  try {
    return await client.orders.create(payload);
  } catch (error) {
    const wrapped = normalizeRazorpayError(error, "Razorpay could not create the payment order.");
    const diagnostics = getRazorpayDiagnostics();
    console.error("[Razorpay] Order creation failed", {
      ...diagnostics,
      statusCode: wrapped.statusCode,
      gatewayCode: wrapped.gatewayCode || "",
    });
    throw wrapped;
  }
}

export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
} = {}) {
  const keySecret = getKeySecret();

  if (!keySecret) {
    const err = new Error("RAZORPAY_KEY_SECRET is not configured.");
    err.code = "RAZORPAY_SECRET_MISSING";
    throw err;
  }

  const finalOrderId = String(orderId || razorpay_order_id || "").trim();
  const finalPaymentId = String(paymentId || razorpay_payment_id || "").trim();
  const finalSignature = String(
    signature || razorpay_signature || "",
  ).trim().toLowerCase();

  if (!finalOrderId || !finalPaymentId || !finalSignature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${finalOrderId}|${finalPaymentId}`, "utf8")
    .digest("hex");

  if (expected.length !== finalSignature.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(finalSignature, "utf8"),
  );
}

/*
 * Supports both:
 * verifyCheckoutSignature({ orderId, paymentId, signature })
 * verifyCheckoutSignature(orderId, paymentId, signature)
 */
export function verifyCheckoutSignature(input, paymentIdArg, signatureArg) {
  if (typeof input === "object" && input !== null) {
    return verifyPaymentSignature(input);
  }

  return verifyPaymentSignature({
    orderId: input,
    paymentId: paymentIdArg,
    signature: signatureArg,
  });
}

export function verifyWebhookSignature(rawBody, signature) {
  const webhookSecret = getWebhookSecret();
  if (!webhookSecret || !rawBody || !signature) return false;

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(
      Buffer.isBuffer(rawBody)
        ? rawBody
        : Buffer.from(String(rawBody), "utf8"),
    )
    .digest("hex");

  const actual = String(signature).trim();

  if (expected.length !== actual.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(actual, "utf8"),
  );
}

/**
 * Safe diagnostics for server logs. NEVER returns the secret itself.
 */
export function getRazorpayDiagnostics() {
  const keyId = getKeyId();
  const secret = getKeySecret();
  return {
    mode: getRazorpayMode(),
    keyIdPrefix: keyId ? keyId.slice(0, 12) : "",
    keyIdLength: keyId.length,
    secretLength: secret.length,
    secretFingerprint: secret
      ? crypto.createHash("sha256").update(secret, "utf8").digest("hex").slice(0, 12)
      : "",
    webhookConfigured: Boolean(getWebhookSecret()),
  };
}

export const createOrder = createRazorpayOrder;
export const verifySignature = verifyPaymentSignature;
export const verifyWebhook = verifyWebhookSignature;

export default {
  getPublicKeyId,
  getRazorpayMode,
  getRazorpayKeyId,
  getRazorpayDiagnostics,
  isRazorpayConfigured,
  getRazorpayClient,
  createRazorpayOrder,
  createOrder,
  verifyPaymentSignature,
  verifyCheckoutSignature,
  verifySignature,
  verifyWebhookSignature,
  verifyWebhook,
};
