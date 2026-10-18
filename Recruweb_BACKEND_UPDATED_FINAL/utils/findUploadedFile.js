import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Every upload-serving route (candidate resume/offer-letter/documents, KYC
// documents, the raw /uploads static mount, etc.) used to do a single
// fs.existsSync() check against the exact path stored in the database and
// give up with a 404 ("Stored file not found" / "File not found") the
// moment that didn't match. In practice a lot of "missing" files are not
// actually gone — they were written under a different uploads/<subfolder>
// than the one now recorded (e.g. an older deploy, a moved folder, or a
// path saved before a bug fix changed where a given upload type lives).
// The file itself, under the exact same generated filename, is usually
// still sitting somewhere inside backend/uploads/.
//
// findUploadedFile() tries the exact recorded path first (fast path, no
// disk walk) and only falls back to a one-time recursive search for a
// file with the same basename anywhere under uploads/ when that fails.
// Every caller that used to do `fs.existsSync(absolute) ? absolute : null`
// should use this instead so a merely-misplaced file still previews
// correctly instead of showing a false "file not found" error.

const UTILS_DIR = path.dirname(fileURLToPath(import.meta.url));
export const BACKEND_ROOT = path.resolve(UTILS_DIR, "..");
export const UPLOADS_ROOT = path.join(BACKEND_ROOT, "uploads");

// Cache of basename -> absolute path, rebuilt at most once every 30s so a
// burst of preview clicks doesn't re-walk the whole uploads tree per file.
let basenameIndex = null;
let indexBuiltAt = 0;
const INDEX_TTL_MS = 30_000;

const walk = (dir, out) => {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile()) {
      // Last one found wins for a given basename — fine in practice since
      // the generated filenames (Date.now()-random.ext) are effectively
      // unique across the whole project.
      out.set(entry.name, full);
    }
  }
};

const getBasenameIndex = () => {
  const now = Date.now();
  if (!basenameIndex || now - indexBuiltAt > INDEX_TTL_MS) {
    basenameIndex = new Map();
    walk(UPLOADS_ROOT, basenameIndex);
    indexBuiltAt = now;
  }
  return basenameIndex;
};

/**
 * Resolve a stored file reference (e.g. "/uploads/resumes/123-45.pdf",
 * "uploads/kyc-documents/123-45.pdf", or just "123-45.pdf") to an absolute
 * path that actually exists on disk, or null if it truly can't be found
 * anywhere under uploads/.
 */
export const findUploadedFile = (storedPath) => {
  const clean = String(storedPath || "").replace(/^[/\\]+/, "");
  if (!clean) return null;

  // 1) Exact path as recorded, resolved against the backend root.
  const exact = path.resolve(BACKEND_ROOT, clean);
  const uploadsPrefix = UPLOADS_ROOT + path.sep;
  if (exact.startsWith(uploadsPrefix) && fs.existsSync(exact)) {
    return exact;
  }

  // 2) Same basename, anywhere under uploads/ (handles files that were
  // written into a different subfolder than the one now on record).
  const basename = path.basename(clean);
  const index = getBasenameIndex();
  const hit = index.get(basename);
  if (hit && fs.existsSync(hit)) {
    return hit;
  }

  // 3) One more try in case the file appeared after the cache was built
  // (e.g. it was uploaded a second ago) — force a fresh walk once.
  basenameIndex = null;
  const freshIndex = getBasenameIndex();
  const freshHit = freshIndex.get(basename);
  if (freshHit && fs.existsSync(freshHit)) {
    return freshHit;
  }

  return null;
};

export const CONTENT_TYPES_BY_EXT = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

/**
 * Streams a stored upload back to the client, using findUploadedFile()'s
 * fallback search, with a consistent Content-Type/Content-Disposition and
 * a friendly 404 JSON body when the file genuinely cannot be located.
 */
export const sendUploadedFile = (res, storedPath, downloadName = "document") => {
  const absolute = findUploadedFile(storedPath);
  if (!absolute) {
    return res.status(404).json({
      success: false,
      message:
        "This file could not be found. It may have been deleted or the upload never completed — please re-upload it.",
    });
  }

  const ext = path.extname(absolute).toLowerCase();
  res.setHeader(
    "Content-Type",
    CONTENT_TYPES_BY_EXT[ext] || "application/octet-stream",
  );
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${String(downloadName).replace(/[^a-z0-9._-]/gi, "_")}"`,
  );
  return res.sendFile(absolute);
};
