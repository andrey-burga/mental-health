import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import healthHandler from "./api/ai/health.ts";
import safetyHandler from "./api/ai/safety.ts";
import reflectionHandler from "./api/ai/reflection.ts";
import analyzeMoodHandler from "./api/ai/analyze-mood.ts";
import { sendError } from "./api/_lib/http.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carga variables locales sin sobrescribir secretos inyectados por el entorno
for (const envFile of [".env.local", ".env"]) {
  const fullPath = path.join(__dirname, envFile);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath, override: false });
  }
}

async function createServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === "production";

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "256kb" }));

  // Rutas /api/* compartidas con funciones serverless de Vercel
  app.all("/api/ai/health", (req, res) => {
    void healthHandler(req, res);
  });

  app.all("/api/ai/safety", (req, res) => {
    void safetyHandler(req, res);
  });

  app.all("/api/ai/reflection", (req, res) => {
    void reflectionHandler(req, res);
  });

  app.all("/api/ai/analyze-mood", (req, res) => {
    void analyzeMoodHandler(req, res);
  });

  // Cualquier ruta /api/* no encontrada responde JSON consistente
  app.use("/api", (_req, res) => {
    sendError(res, 404, "API_ROUTE_NOT_FOUND", "La ruta de API solicitada no existe.");
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor Tu Espacio Seguro escuchando en http://0.0.0.0:${port}`);
  });
}

createServer().catch((err) => {
  console.error("Error fatal al iniciar el servidor:", err);
  process.exit(1);
});
