import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Resolve to an absolute path anchored to this file's own directory
// (backend/uploads/id-documents) instead of a "uploads/id-documents" path
// that multer would otherwise resolve relative to process.cwd(). A
// relative path here silently wrote uploads to the wrong folder whenever
// the server was started from a different working directory than
// /backend, which made every previously-uploaded file "disappear" (404 /
// "Stored file not found") even though the upload itself reported success.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.join(__dirname, "..", "uploads", "id-documents");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1000000) + path.extname(file.originalname));
  },
});

// NOTE: PDF is intentionally NOT in this list. Tesseract.js (used in
// utils/documentVerification.js) can only OCR raster images — passing it a
// PDF throws inside its worker thread in a way that bypasses the calling
// route's try/catch and crashes the whole Node process. If PDF uploads are
// needed later, convert the first page to an image (e.g. with `pdf-to-img`
// or `pdf-poppler`) before calling Tesseract.recognize(), rather than
// re-adding ".pdf" here.
const fileFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error("Only JPG/PNG/WEBP images are allowed for ID documents"));
  }
  cb(null, true);
};

export default multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter,
});