import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Database setup
const db = new Database("files.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_name TEXT,
    filename TEXT,
    mime_type TEXT,
    size INTEGER,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const stmt = db.prepare(
      "INSERT INTO files (original_name, filename, mime_type, size) VALUES (?, ?, ?, ?)"
    );
    const info = stmt.run(
      req.file.originalname,
      req.file.filename,
      req.file.mimetype,
      req.file.size
    );

    res.json({
      id: info.lastInsertRowid,
      original_name: req.file.originalname,
      filename: req.file.filename,
    });
  });

  app.get("/api/files", (req, res) => {
    const files = db.prepare("SELECT * FROM files ORDER BY uploaded_at DESC").all();
    res.json(files);
  });

  app.get("/api/download/:filename", (req, res) => {
    const { filename } = req.params;
    const file = db.prepare("SELECT * FROM files WHERE filename = ?").get(filename) as any;

    if (!file) {
      return res.status(404).send("File not found");
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found on disk");
    }

    res.download(filePath, file.original_name);
  });

  app.delete("/api/files/:id", (req, res) => {
    const { id } = req.params;
    const file = db.prepare("SELECT * FROM files WHERE id = ?").get(id) as any;

    if (file) {
      const filePath = path.join(UPLOADS_DIR, file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      db.prepare("DELETE FROM files WHERE id = ?").run(id);
    }

    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
