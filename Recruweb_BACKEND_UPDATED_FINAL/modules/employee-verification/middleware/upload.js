import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Stored inside the main backend's existing /uploads folder (already served
// statically at /uploads by index.js) under an "employee-verification"
// sub-folder, so no new static route is needed.
const uploadDir = path.join(__dirname, "..", "..", "..", "uploads", "employee-verification");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

export const evUpload = multer({ storage });
export { uploadDir };
