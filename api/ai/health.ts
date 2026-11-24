import {
  GEMINI_TEXT_MODEL,
  isGeminiConfigured,
} from "../_lib/gemini.js";
import {
  applyCors,
  checkRateLimit,
  sendError,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http.js";

export default async function handler(
  req: ApiRequest,
  res: ApiResponse
): Promise<void> {
  if (!applyCors(req, res)) return;

  if (!checkRateLimit(req, res, { scope: "ai-health", maxRequests: 60, windowMs: 60_000 })) {
    return;
  }

  if (req.method !== "GET") {
    sendError(res, 405, "METHOD_NOT_ALLOWED", "Solo se permite el método GET en este endpoint.");
    return;
  }

  sendJson(res, 200, {
    ok: true,
    service: "ai",
    aiConfigured: isGeminiConfigured(),
    model: GEMINI_TEXT_MODEL,
    timestamp: new Date().toISOString(),
  });
}
