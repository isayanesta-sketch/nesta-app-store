const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const MAX_MB = Math.max(1, Number(process.env.MAX_UPLOAD_MB || 250));
const ROOT = __dirname;
const UPLOADS = path.join(ROOT, "uploads");
const DATA_DIR = path.join(ROOT, "data");
const DB = path.join(DATA_DIR, "apps.json");

for (const dir of [UPLOADS, DATA_DIR]) fs.mkdirSync(dir, { recursive: true });
if (!fs.existsSync(DB)) fs.writeFileSync(DB, "[]");

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "1mb" }));
app.use("/api/", rateLimit({ windowMs: 60_000, limit: 100 }));
app.use(express.static(path.join(ROOT, "public")));

function readApps() {
  try { const x = JSON.parse(fs.readFileSync(DB, "utf8")); return Array.isArray(x) ? x : []; }
  catch { return []; }
}
function writeApps(apps) {
  const tmp = DB + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(apps, null, 2));
  fs.renameSync(tmp, DB);
}
function requireAdmin(req, res, next) {
  const supplied = req.get("x-admin-password") || "";
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: "Tsy mbola voafaritra ny ADMIN_PASSWORD ao amin'ny .env." });
  const a = Buffer.from(supplied), b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
    return res.status(401).json({ error: "Mot de passe admin diso." });
  next();
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS),
  filename: (_req, _file, cb) => cb(null, crypto.randomUUID() + ".apk")
});
const upload = multer({
  storage,
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== ".apk")
      return cb(new Error("Rakitra .apk ihany no azo ampidirina."));
    cb(null, true);
  }
});

app.get("/api/apps", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(readApps().filter(a => a.published).map(({ id, name, category, description, version, size, createdAt, downloads }) =>
    ({ id, name, category, description, version, size, createdAt, downloads })));
});

app.post("/api/admin/upload", requireAdmin, upload.single("apk"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Tsy nisy APK voafidy." });
  const name = String(req.body.name || "").trim();
  if (!name) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "Fenoy ny anaran'ny application." });
  }
  const apps = readApps();
  const item = {
    id: crypto.randomUUID(),
    name: name.slice(0, 80),
    category: String(req.body.category || "Autres").trim().slice(0, 40),
    description: String(req.body.description || "").trim().slice(0, 500),
    version: String(req.body.version || "1.0").trim().slice(0, 30),
    file: req.file.filename,
    size: req.file.size,
    downloads: 0,
    published: true,
    createdAt: new Date().toISOString()
  };
  apps.unshift(item); writeApps(apps);
  res.status(201).json({ ok: true, app: item });
});

app.get("/api/admin/apps", requireAdmin, (_req, res) => res.json(readApps()));

app.delete("/api/admin/apps/:id", requireAdmin, (req, res) => {
  const apps = readApps(), item = apps.find(a => a.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Tsy hita ilay app." });
  const filePath = path.join(UPLOADS, path.basename(item.file));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  writeApps(apps.filter(a => a.id !== item.id));
  res.json({ ok: true });
});

app.get("/download/:id", (req, res) => {
  const apps = readApps(), item = apps.find(a => a.id === req.params.id && a.published);
  if (!item) return res.status(404).send("APK tsy hita.");
  const filePath = path.join(UPLOADS, path.basename(item.file));
  if (!fs.existsSync(filePath)) return res.status(404).send("Tsy hita ao amin'ny serveur ilay rakitra.");
  item.downloads = (item.downloads || 0) + 1; writeApps(apps);
  res.download(filePath, `${item.name.replace(/[^a-z0-9-_]/gi, "_")}.apk`);
});

app.get("/health", (_req, res) => res.json({ ok: true, app: "NESTA APP STORE", version: "2.0.0" }));
app.use((err, _req, res, _next) => {
  const msg = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
    ? `Lehibe loatra ilay APK. Fetra: ${MAX_MB} MB.` : (err.message || "Nisy olana.");
  res.status(400).json({ error: msg });
});
app.listen(PORT, "0.0.0.0", () => console.log(`NESTA APP STORE mandeha amin'ny port ${PORT}`));
