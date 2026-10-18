import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Resolve to an absolute path anchored to this file's own directory
// (backend/uploads/resumes) instead of a "uploads/resumes" path that
// multer would otherwise resolve relative to process.cwd(). A relative
// path here silently wrote uploads to the wrong folder whenever the
// server was started from a different working directory than /backend,
// which made every previously-uploaded file "disappear" (404 / "Stored
// file not found") even though the upload itself reported success.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadPath = path.join(__dirname, "..", "uploads", "resumes");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },

  filename(req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1000000) +
        path.extname(file.originalname),
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx"];

  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowed.includes(ext)) {
    return cb(new Error("Only PDF/DOC/DOCX allowed"));
  }

  cb(null, true);
};

export default multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});
