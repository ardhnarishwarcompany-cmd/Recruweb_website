import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

// Extra Module — Security: Backup System.
// Uses the `mysqldump` / `mysql` CLI tools (bundled with any MySQL/MariaDB
// install, including XAMPP/WAMP) to create and restore full SQL dumps of
// the live database. The DB password is passed via the MYSQL_PWD env var
// (never as a CLI argument) so it never shows up in `ps`/process lists.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BACKUP_DIR = path.join(__dirname, "..", "backups");

const dbConfig = () => ({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "recruweb",
});

export const ensureBackupDir = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
};

const safeFilename = (name) =>
  /^[A-Za-z0-9._-]+\.sql$/.test(name) && !name.includes("..");

const timestampedName = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `recruweb-backup-${stamp}.sql`;
};

// Resolves the mysqldump/mysql binary. Set MYSQLDUMP_PATH / MYSQL_CLI_PATH
// in .env if the tool isn't on PATH (common on Windows/XAMPP installs, e.g.
// "C:\\xampp\\mysql\\bin\\mysqldump.exe").
const dumpBin = () => process.env.MYSQLDUMP_PATH || "mysqldump";
const mysqlBin = () => process.env.MYSQL_CLI_PATH || "mysql";

// Runs a dump/restore CLI process and resolves/rejects on exit.
const runProcess = (bin, args, { outStream, inStream } = {}) =>
  new Promise((resolve, reject) => {
    const cfg = dbConfig();
    const child = spawn(bin, args, {
      env: { ...process.env, MYSQL_PWD: cfg.password },
    });

    let stderr = "";
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    if (outStream) child.stdout.pipe(outStream);
    if (inStream) inStream.pipe(child.stdin);

    child.on("error", (err) => {
      reject(
        new Error(
          `Could not start "${bin}". Make sure MySQL client tools are ` +
            `installed and on PATH, or set MYSQLDUMP_PATH/MYSQL_CLI_PATH ` +
            `in .env. (${err.message})`,
        ),
      );
    });

    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(stderr.trim() || `${bin} exited with code ${code}`));
    });
  });

// Creates a fresh dump of the whole database. Returns { filename, filePath, sizeBytes, durationMs }.
export const createBackup = async () => {
  ensureBackupDir();
  const cfg = dbConfig();
  const filename = timestampedName();
  const filePath = path.join(BACKUP_DIR, filename);
  const started = Date.now();

  const args = [
    "-h",
    String(cfg.host),
    "-P",
    String(cfg.port),
    "-u",
    cfg.user,
    "--single-transaction",
    "--routines",
    "--triggers",
    cfg.database,
  ];

  const outStream = fs.createWriteStream(filePath);
  try {
    await runProcess(dumpBin(), args, { outStream });
  } catch (err) {
    // Don't leave a partial/corrupt file behind on failure.
    outStream.close();
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw err;
  }

  const stats = fs.statSync(filePath);
  return {
    filename,
    filePath,
    sizeBytes: stats.size,
    durationMs: Date.now() - started,
  };
};

// Lists backups currently on disk, newest first.
export const listBackupFiles = () => {
  ensureBackupDir();
  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".sql"))
    .map((filename) => {
      const stats = fs.statSync(path.join(BACKUP_DIR, filename));
      return {
        filename,
        sizeBytes: stats.size,
        createdAt: stats.birthtime || stats.ctime,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getBackupPath = (filename) => {
  if (!safeFilename(filename)) return null;
  const filePath = path.join(BACKUP_DIR, filename);
  return fs.existsSync(filePath) ? filePath : null;
};

export const deleteBackupFile = (filename) => {
  const filePath = getBackupPath(filename);
  if (!filePath) return false;
  fs.unlinkSync(filePath);
  return true;
};

// Restores the database from a given backup file (DESTRUCTIVE — overwrites
// current data for every statement in the dump). Caller must gate this
// behind an explicit confirmation + super admin only.
export const restoreBackup = async (filename) => {
  const filePath = getBackupPath(filename);
  if (!filePath) throw new Error("Backup file not found");

  const cfg = dbConfig();
  const args = [
    "-h",
    String(cfg.host),
    "-P",
    String(cfg.port),
    "-u",
    cfg.user,
    cfg.database,
  ];

  const inStream = fs.createReadStream(filePath);
  await runProcess(mysqlBin(), args, { inStream });
};
