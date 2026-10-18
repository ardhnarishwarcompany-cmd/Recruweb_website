import Tesseract from "tesseract.js";

// ============================================================================
// IMPORTANT — SCOPE OF THIS MODULE
// This performs FORMAT-LEVEL verification only:
//   1. OCRs the uploaded Aadhaar/PAN image to plain text
//   2. Validates the extracted number against its real public checksum
//      algorithm (Aadhaar = Verhoeff algorithm; PAN = official regex pattern)
//   3. Fuzzy-matches the extracted name against the name the candidate typed
// It does NOT call UIDAI, NSDL, or any government database — no such
// integration is possible without a licensed government API contract, which
// this app does not have. Callers must present results as "format verified",
// never as "government verified", to avoid misleading candidates/recruiters.
// ============================================================================

// ---- Aadhaar: real Verhoeff checksum algorithm (public UIDAI spec) ----
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

export const verhoeffIsValid = (numStr) => {
  if (!/^\d{12}$/.test(numStr)) return false;
  const digits = numStr.split("").reverse().map(Number);
  let checksum = 0;
  for (let i = 0; i < digits.length; i++) {
    checksum = d[checksum][p[i % 8][digits[i]]];
  }
  return checksum === 0;
};

export const extractAadhaarNumbers = (text) => {
  // Aadhaar is displayed as groups of 4 digits (e.g. "1234 5678 9012")
  const matches = text.match(/\b(\d{4}[\s-]?\d{4}[\s-]?\d{4})\b/g) || [];
  return matches.map((m) => m.replace(/[\s-]/g, "")).filter((n) => n.length === 12);
};

// ---- PAN: official CBDT format — AAAAA9999A, 4th char = holder type ----
const PAN_REGEX = /\b([A-Z]{5}[0-9]{4}[A-Z])\b/;

export const extractPAN = (text) => {
  const match = text.toUpperCase().replace(/\s+/g, "").match(PAN_REGEX);
  return match ? match[1] : null;
};

const PAN_HOLDER_TYPES = {
  P: "Individual", C: "Company", H: "HUF", A: "AOP", B: "BOI",
  G: "Government", J: "Artificial Judicial Person", L: "Local Authority",
  F: "Firm/LLP", T: "Trust", E: "LLP",
};

// ---- Simple name fuzzy match (Levenshtein-based similarity 0-1) ----
const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
};

export const nameSimilarity = (nameA, nameB) => {
  const a = (nameA || "").toLowerCase().replace(/[^a-z\s]/g, "").trim();
  const b = (nameB || "").toLowerCase().replace(/[^a-z\s]/g, "").trim();
  if (!a || !b) return 0;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 0 : Math.max(0, 1 - dist / maxLen);
};

// OCRs the uploaded document image to plain text using Tesseract.js (runs
// fully locally — no external API call, no image ever leaves the server).
export const ocrDocument = async (filePath) => {
  // Tesseract.js cannot OCR PDFs — feeding it one throws inside its worker
  // thread in a way that escapes normal promise rejection handling and
  // crashes the whole server (not just this request). Fail fast and
  // predictably instead.
  if (filePath.toLowerCase().endsWith(".pdf")) {
    throw new Error(
      "PDF files are not supported for ID verification — please upload a JPG, PNG, or WEBP photo/scan instead."
    );
  }
  const { data } = await Tesseract.recognize(filePath, "eng");
  return data.text || "";
};

/**
 * Full format-level verification pipeline for an uploaded Aadhaar or PAN
 * image. Returns a result object the frontend must render as
 * "Format Verified" (never "Government Verified").
 */
export const verifyIdDocument = async ({ filePath, docType, candidateName }) => {
  const rawText = await ocrDocument(filePath);

  if (docType === "aadhaar") {
    const candidates = extractAadhaarNumbers(rawText);
    const validNumber = candidates.find((n) => verhoeffIsValid(n));
    const similarity = nameSimilarity(candidateName, rawText); // best-effort: name is scanned within the whole OCR block

    return {
      docType: "aadhaar",
      ocrTextPreview: rawText.slice(0, 500),
      numbersFound: candidates.length,
      checksumValid: !!validNumber,
      maskedNumber: validNumber ? `XXXX-XXXX-${validNumber.slice(-4)}` : null,
      nameSimilarity: Math.round(similarity * 100) / 100,
      nameLikelyMatches: similarity >= 0.55,
      verificationLevel: "format", // NEVER "government" — see module header
      passed: !!validNumber && similarity >= 0.4,
    };
  }

  if (docType === "pan") {
    const pan = extractPAN(rawText);
    const similarity = nameSimilarity(candidateName, rawText);
    return {
      docType: "pan",
      ocrTextPreview: rawText.slice(0, 500),
      panFound: !!pan,
      maskedPan: pan ? `${pan.slice(0, 3)}XXX${pan.slice(-2)}` : null,
      holderType: pan ? PAN_HOLDER_TYPES[pan[3]] || "Unknown" : null,
      nameSimilarity: Math.round(similarity * 100) / 100,
      nameLikelyMatches: similarity >= 0.55,
      verificationLevel: "format",
      passed: !!pan && similarity >= 0.4,
    };
  }

  throw new Error("Unsupported docType — expected 'aadhaar' or 'pan'");
};