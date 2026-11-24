import { ThinkingLevel } from "@google/genai";
import {
  CLINICAL_SYSTEM_INSTRUCTION,
  GEMINI_TEXT_MODEL,
  evaluateSafetyServerSide,
  getGeminiClient,
  isGeminiQuotaCoolingDown,
  isQuotaExhaustedError,
  markGeminiQuotaCooldown,
} from "../_lib/gemini.js";
import type { CrisisRiskLevel } from "../_lib/crisisPatterns.js";
import {
  applyCors,
  checkRateLimit,
  parseJsonBody,
  sendError,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http.js";

type CompanionRole = "user" | "assistant";
export type CompanionActionCategory = "herramienta" | "lectura" | "trastorno";

export interface CompanionMessageInput {
  role: CompanionRole;
  content: string;
}

export interface CompanionActionItem {
  label: string;
  route: string;
  category: CompanionActionCategory;
}

interface CatalogDisorderSummary {
  title: string;
  slug: string;
  category?: string;
}

interface CatalogArticleSummary {
  title: string;
  category?: string;
}

interface CompanionRequestBody {
  messages?: unknown;
  catalogContext?: unknown;
}

const MAX_HISTORY_TURNS = 10;
const MAX_MESSAGE_CHARS = 1500;
const ACTIONS_DELIMITER = "<<<ACTIONS>>>";

const BASE_ALLOWED_ROUTES = new Set<string>([
  "/respiracion",
  "/sonidos",
  "/diario",
  "/autocuidado-diario",
  "/autocuidado",
  "/ayuda",
  "/dashboard",
  "/salud-mental",
  "/factores-riesgo",
  "/articulos",
  "/trastornos",
  "/testimonios",
  "/trastornos/trastorno-de-ansiedad-generalizada",
  "/trastornos/trastorno-de-panico",
  "/trastornos/trastorno-depresivo-mayor",
  "/trastornos/trastorno-bipolar",
  "/trastornos/trastorno-obsesivo-compulsivo",
  "/trastornos/trastorno-por-estres-postraumatico",
  "/trastornos/ansiedad",
  "/trastornos/depresion",
  "/trastornos/estres",
  "/trastornos/panico",
  "/trastornos/toc",
  "/trastornos/bipolar",
]);

function initSseResponse(res: ApiResponse): void {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  const flushable = res as ApiResponse & { flushHeaders?: () => void };
  if (typeof flushable.flushHeaders === "function") {
    flushable.flushHeaders();
  }
}

function writeSseEvent(res: ApiResponse, payload: Record<string, unknown>): void {
  if (res.writableEnded || res.destroyed) return;
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function normalizeMessages(raw: unknown): CompanionMessageInput[] {
  if (!Array.isArray(raw)) return [];
  const normalized: CompanionMessageInput[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const record = item as { role?: unknown; content?: unknown };
    const role = record.role === "assistant" ? "assistant" : record.role === "user" ? "user" : null;
    if (!role || typeof record.content !== "string") continue;

    const content = record.content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!content) continue;
    normalized.push({ role, content });
  }

  return normalized.slice(-MAX_HISTORY_TURNS);
}

function normalizeCatalogContext(raw: unknown): {
  disorders: CatalogDisorderSummary[];
  articles: CatalogArticleSummary[];
  dynamicRoutes: Set<string>;
} {
  const disorders: CatalogDisorderSummary[] = [];
  const articles: CatalogArticleSummary[] = [];
  const dynamicRoutes = new Set<string>();

  if (!raw || typeof raw !== "object") {
    return { disorders, articles, dynamicRoutes };
  }

  const obj = raw as { disorders?: unknown; articles?: unknown };

  if (Array.isArray(obj.disorders)) {
    for (const item of obj.disorders.slice(0, 12)) {
      if (!item || typeof item !== "object") continue;
      const d = item as { title?: unknown; slug?: unknown; category?: unknown };
      const title = typeof d.title === "string" ? d.title.trim().slice(0, 90) : "";
      const slug =
        typeof d.slug === "string"
          ? d.slug
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, "")
              .slice(0, 90)
          : "";
      const category =
        typeof d.category === "string" ? d.category.trim().slice(0, 40) : undefined;
      if (title && slug) {
        disorders.push({ title, slug, category });
        dynamicRoutes.add(`/trastornos/${slug}`);
      }
    }
  }

  if (Array.isArray(obj.articles)) {
    for (const item of obj.articles.slice(0, 8)) {
      if (!item || typeof item !== "object") continue;
      const a = item as { title?: unknown; category?: unknown };
      const title = typeof a.title === "string" ? a.title.trim().slice(0, 100) : "";
      const category =
        typeof a.category === "string" ? a.category.trim().slice(0, 40) : undefined;
      if (title) {
        articles.push({ title, category });
      }
    }
  }

  return { disorders, articles, dynamicRoutes };
}

function sanitizeCategory(raw?: unknown): CompanionActionCategory {
  if (raw === "herramienta" || raw === "lectura" || raw === "trastorno") {
    return raw;
  }
  return "herramienta";
}

function sanitizeRoute(raw: unknown, dynamicRoutes: Set<string>): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim();
  if (BASE_ALLOWED_ROUTES.has(cleaned) || dynamicRoutes.has(cleaned)) {
    return cleaned;
  }
  return null;
}

function parseActionsBlock(
  rawActions: string,
  dynamicRoutes: Set<string>
): CompanionActionItem[] {
  const trimmed = rawActions
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  if (!trimmed) return [];

  const startIdx = trimmed.indexOf("[");
  const endIdx = trimmed.lastIndexOf("]");
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return [];

  try {
    const parsed = JSON.parse(trimmed.slice(startIdx, endIdx + 1)) as unknown;
    if (!Array.isArray(parsed)) return [];

    const deduped: CompanionActionItem[] = [];
    const seenRoutes = new Set<string>();

    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") continue;
      const item = entry as { label?: unknown; route?: unknown; category?: unknown };
      const route = sanitizeRoute(item.route, dynamicRoutes);
      const label =
        typeof item.label === "string" ? item.label.trim().slice(0, 64) : "";
      if (!route || !label || seenRoutes.has(route)) continue;
      seenRoutes.add(route);
      deduped.push({
        label,
        route,
        category: sanitizeCategory(item.category),
      });
      if (deduped.length >= 3) break;
    }

    return deduped;
  } catch {
    return [];
  }
}

function inferFallbackActions(userText: string): CompanionActionItem[] {
  const lower = userText.toLowerCase();

  if (/(dormir|insomnio|sueño|sueno|noche|descans)/.test(lower)) {
    return [
      {
        label: "Escuchar sonidos para descansar",
        route: "/sonidos",
        category: "herramienta",
      },
      {
        label: "Practicar respiración nocturna",
        route: "/respiracion",
        category: "herramienta",
      },
    ];
  }

  if (/(ansiedad|nervio|pánico|panico|abrumad|acelerad|pecho)/.test(lower)) {
    return [
      {
        label: "Ejercicio de respiración guiada",
        route: "/respiracion",
        category: "herramienta",
      },
      {
        label: "Comprender la ansiedad",
        route: "/trastornos/trastorno-de-ansiedad-generalizada",
        category: "trastorno",
      },
    ];
  }

  if (/(triste|desánim|desanim|depresi|agotad|vacío|vacio)/.test(lower)) {
    return [
      {
        label: "Explorar señales de depresión",
        route: "/trastornos/trastorno-depresivo-mayor",
        category: "trastorno",
      },
      {
        label: "Escribir en mi diario emocional",
        route: "/diario",
        category: "herramienta",
      },
    ];
  }

  return [
    {
      label: "Practicar respiración guiada",
      route: "/respiracion",
      category: "herramienta",
    },
    {
      label: "Explorar guías de autocuidado",
      route: "/autocuidado",
      category: "lectura",
    },
  ];
}

function buildCuratedFallbackReply(userText: string): {
  text: string;
  actions: CompanionActionItem[];
} {
  const lower = userText.toLowerCase();
  const actions = inferFallbackActions(userText);

  if (/(dormir|insomnio|sueño|sueno|descans)/.test(lower)) {
    return {
      text:
        "Cuando la mente sigue activa por la noche, cuesta mucho conciliar el descanso y es normal sentir frustración. Bajar el ritmo sensorial con respiración lenta y sonidos suaves ayuda a indicarle a tu sistema nervioso que puede soltar la alerta. Si deseas, prueba unos minutos de audios relajantes o anota tus pendientes en el diario para sacarlos de tu cabeza antes de dormir.",
      actions,
    };
  }

  if (/(ansiedad|nervio|pánico|panico|abrumad)/.test(lower)) {
    return {
      text:
        "Sentirse abrumado o con ansiedad activa el sistema de alarma del cuerpo, aunque no haya un peligro físico inmediato. Empezar por regular la respiración —exhalando más lento de lo que inhalas— suele aliviar esa presión poco a poco. También puedes leer nuestra guía psicoeducativa sobre ansiedad para entender mejor estas señales sin juzgarte.",
      actions,
    };
  }

  return {
    text:
      "Gracias por compartir cómo te sientes hoy. Darte un momento para observar tus emociones sin exigirte resolverlo todo al instante ya es una forma genuina de cuidado. Si te sirve ahora mismo, puedes apoyarte en una pausa breve de respiración guiada o explorar las guías de autocuidado pensadas para acompañarte paso a paso.",
    actions,
  };
}

async function streamTextChunks(
  res: ApiResponse,
  fullText: string,
  actions: CompanionActionItem[],
  isAborted: () => boolean
): Promise<void> {
  const words = fullText.split(/(\s+)/);
  let buffer = "";
  for (let i = 0; i < words.length; i += 1) {
    if (isAborted()) return;
    buffer += words[i];
    if (buffer.length >= 18 || i === words.length - 1) {
      writeSseEvent(res, { type: "chunk", text: buffer });
      buffer = "";
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
  if (!isAborted()) {
    writeSseEvent(res, { type: "actions", items: actions });
    writeSseEvent(res, { type: "done" });
  }
}

export default async function handler(
  req: ApiRequest,
  res: ApiResponse
): Promise<void> {
  if (!applyCors(req, res)) return;

  if (
    !checkRateLimit(req, res, {
      scope: "ai-companion",
      maxRequests: 25,
      windowMs: 60_000,
    })
  ) {
    return;
  }

  if (req.method !== "POST") {
    sendError(
      res,
      405,
      "METHOD_NOT_ALLOWED",
      "Solo se permite el método POST en este endpoint."
    );
    return;
  }

  let body: CompanionRequestBody;
  try {
    body = await parseJsonBody<CompanionRequestBody>(req);
  } catch (err) {
    sendError(
      res,
      400,
      "INVALID_JSON",
      err instanceof Error ? err.message : "No se pudo interpretar el JSON."
    );
    return;
  }

  const messages = normalizeMessages(body.messages);
  if (messages.length === 0) {
    sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "Debes enviar al menos un mensaje válido en 'messages'."
    );
    return;
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "user") {
    sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "El último mensaje de la conversación debe pertenecer al usuario."
    );
    return;
  }

  const { disorders, articles, dynamicRoutes } = normalizeCatalogContext(
    body.catalogContext
  );

  // 1. Guardrail obligatorio previo: detectar crisis antes de abrir generación conversacional
  const safety = await evaluateSafetyServerSide(lastMessage.content);
  if (
    safety.isCrisis ||
    safety.riskLevel === "moderate" ||
    safety.riskLevel === "high"
  ) {
    const riskLevel: CrisisRiskLevel =
      safety.riskLevel === "none" ? "moderate" : safety.riskLevel;
    initSseResponse(res);
    writeSseEvent(res, {
      type: "crisis",
      riskLevel,
      reason:
        safety.reason ||
        "Se detectaron señales emocionales que ameritan apoyo prioritario.",
      matchedSignals: safety.matchedSignals,
      safetySource: safety.source,
    });
    writeSseEvent(res, { type: "done" });
    res.end();
    return;
  }

  // 2. Preparar SSE
  initSseResponse(res);

  let clientClosed = false;
  res.on("close", () => {
    if (!res.writableFinished) {
      clientClosed = true;
    }
  });
  const isAborted = () => clientClosed || res.writableEnded || res.destroyed;

  const ai = getGeminiClient();
  if (!ai) {
    if (!isAborted()) res.write(": source=fallback-unconfigured\n\n");
    const curated = buildCuratedFallbackReply(lastMessage.content);
    await streamTextChunks(res, curated.text, curated.actions, isAborted);
    res.end();
    return;
  }

  if (isGeminiQuotaCoolingDown()) {
    if (!isAborted()) res.write(": source=fallback-cooldown\n\n");
    const curated = buildCuratedFallbackReply(lastMessage.content);
    await streamTextChunks(res, curated.text, curated.actions, isAborted);
    res.end();
    return;
  }

  const disorderCatalogLines =
    disorders.length > 0
      ? disorders.map((d) => `- ${d.title}: /trastornos/${d.slug}`).join("\n")
      : `- Trastorno de Ansiedad Generalizada: /trastornos/trastorno-de-ansiedad-generalizada
- Trastorno de Pánico: /trastornos/trastorno-de-panico
- Trastorno Depresivo Mayor: /trastornos/trastorno-depresivo-mayor
- Trastorno Bipolar: /trastornos/trastorno-bipolar
- Trastorno Obsesivo-Compulsivo: /trastornos/trastorno-obsesivo-compulsivo
- Trastorno por Estrés Postraumático: /trastornos/trastorno-por-estres-postraumatico`;

  const articleCatalogLines =
    articles.length > 0
      ? `\nArtículos destacados en la plataforma (accesibles en /articulos):\n${articles
          .map((a) => `- ${a.title}${a.category ? ` (${a.category})` : ""}`)
          .join("\n")}`
      : "";

  const companionInstruction = `${CLINICAL_SYSTEM_INSTRUCTION}

ROL ACTUAL: Eres el Acompañante Emocional y Guía de Triage Psicoeducativo de "Tu Espacio Seguro".
OBJETIVO:
- Escucha con calidez, valida emociones sin juzgar y ofrece orientación psicoeducativa breve y clara (máximo 130 palabras).
- Orienta suavemente hacia las herramientas y lecturas reales de la plataforma según lo que necesite la persona.
- Recuerda: NUNCA diagnostiques ni prescribas o ajustes medicación.

MAPA REAL DE RUTAS DISPONIBLES:
Herramientas prácticas:
- /respiracion (Respiración Guiada para regular ansiedad o activación)
- /sonidos (Biblioteca de Sonidos relajantes para calma o descanso nocturno)
- /diario (Diario de Emociones privado)
- /autocuidado-diario (Planificador de micro-hábitos diarios)
- /autocuidado (Guías de autocuidado físico, mental y emocional)
- /ayuda (Directorio confidencial de líneas de apoyo y ayuda profesional)

Lecturas y guías psicoeducativas:
- /salud-mental (Conceptos base sobre salud mental)
- /factores-riesgo (Señales tempranas y factores de riesgo)
- /articulos (Artículos sobre límites, descanso y bienestar)
- /trastornos (Catálogo completo de guías sobre condiciones de salud mental)
Guías específicas de trastornos:
${disorderCatalogLines}${articleCatalogLines}

FORMATO OBLIGATORIO DE SALIDA:
1. Primero escribe únicamente tu respuesta conversacional en español en prosa natural y cercana (sin incluir JSON ni rutas crudas en el texto).
2. Al terminar tu respuesta, agrega exactamente esta línea separadora y un JSON válido en la siguiente línea con 1 a 3 acciones sugeridas reales de la lista anterior:
${ACTIONS_DELIMITER}
[{"label":"Nombre corto de la acción","route":"/ruta-real","category":"herramienta"}]
Valores permitidos para "category": "herramienta", "lectura", "trastorno".`;

  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  try {
    const stream = await ai.models.generateContentStream({
      model: GEMINI_TEXT_MODEL,
      contents,
      config: {
        systemInstruction: companionInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    });

    let pendingBuffer = "";
    let inActionsSection = false;
    let actionsBuffer = "";
    let emittedText = false;

    for await (const chunk of stream) {
      if (isAborted()) break;
      const chunkText = chunk.text ?? "";
      if (!chunkText) continue;

      if (inActionsSection) {
        actionsBuffer += chunkText;
        continue;
      }

      pendingBuffer += chunkText;
      const delimiterIndex = pendingBuffer.indexOf(ACTIONS_DELIMITER);

      if (delimiterIndex !== -1) {
        const textBeforeDelimiter = pendingBuffer.slice(0, delimiterIndex);
        if (textBeforeDelimiter) {
          emittedText = true;
          writeSseEvent(res, { type: "chunk", text: textBeforeDelimiter });
        }
        actionsBuffer += pendingBuffer.slice(
          delimiterIndex + ACTIONS_DELIMITER.length
        );
        pendingBuffer = "";
        inActionsSection = true;
      } else {
        // Retener el sufijo suficiente para detectar <<<ACTIONS>>> aunque llegue partido entre chunks
        const safeLength = pendingBuffer.length - (ACTIONS_DELIMITER.length + 2);
        if (safeLength > 0) {
          const safeChunk = pendingBuffer.slice(0, safeLength);
          pendingBuffer = pendingBuffer.slice(safeLength);
          emittedText = true;
          writeSseEvent(res, { type: "chunk", text: safeChunk });
        }
      }
    }

    if (!isAborted()) {
      if (!inActionsSection && pendingBuffer) {
        const cleanedTail = pendingBuffer.replace(/\s*$/, "");
        if (cleanedTail) {
          emittedText = true;
          writeSseEvent(res, { type: "chunk", text: cleanedTail });
        }
      }

      if (!emittedText) {
        res.write(": source=fallback-empty\n\n");
        const curated = buildCuratedFallbackReply(lastMessage.content);
        writeSseEvent(res, { type: "chunk", text: curated.text });
        writeSseEvent(res, { type: "actions", items: curated.actions });
      } else {
        const parsedActions = parseActionsBlock(actionsBuffer, dynamicRoutes);
        const finalActions =
          parsedActions.length > 0
            ? parsedActions
            : inferFallbackActions(lastMessage.content);
        writeSseEvent(res, { type: "actions", items: finalActions });
      }

      writeSseEvent(res, { type: "done" });
    }
  } catch (error) {
    if (!isAborted()) {
      if (isQuotaExhaustedError(error)) {
        const waitSec = markGeminiQuotaCooldown(error);
        res.write(`: source=fallback-quota-${waitSec}s\n\n`);
        console.warn(
          `Acompañante emocional en respaldo curado temporal por cuota (${waitSec}s).`
        );
      } else {
        const reason = error instanceof Error ? error.message : String(error);
        res.write(`: source=fallback-error\n\n`);
        console.warn("Acompañante emocional degradado a respaldo curado:", reason);
      }

      const curated = buildCuratedFallbackReply(lastMessage.content);
      await streamTextChunks(res, curated.text, curated.actions, isAborted);
    }
  } finally {
    if (!res.writableEnded && !res.destroyed) {
      res.end();
    }
  }
}
