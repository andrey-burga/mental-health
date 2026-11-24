import { evaluateSafetyServerSide } from "../_lib/gemini.js";
import {
  applyCors,
  checkRateLimit,
  parseJsonBody,
  sendError,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http.js";

interface SafetyRequestBody {
  text?: unknown;
}

export default async function handler(
  req: ApiRequest,
  res: ApiResponse
): Promise<void> {
  if (!applyCors(req, res)) return;

  if (!checkRateLimit(req, res, { scope: "ai-safety", maxRequests: 30, windowMs: 60_000 })) {
    return;
  }

  if (req.method !== "POST") {
    sendError(res, 405, "METHOD_NOT_ALLOWED", "Solo se permite el método POST en este endpoint.");
    return;
  }

  let body: SafetyRequestBody;
  try {
    body = await parseJsonBody<SafetyRequestBody>(req);
  } catch (err) {
    sendError(
      res,
      400,
      "INVALID_JSON",
      err instanceof Error ? err.message : "No se pudo leer el JSON de la solicitud."
    );
    return;
  }

  if (typeof body.text !== "string" || body.text.trim().length === 0) {
    sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "El campo 'text' es obligatorio y debe contener texto."
    );
    return;
  }

  if (body.text.length > 4000) {
    sendError(
      res,
      400,
      "TEXT_TOO_LONG",
      "El texto supera el máximo permitido de 4000 caracteres."
    );
    return;
  }

  const evaluation = await evaluateSafetyServerSide(body.text);
  sendJson(res, 200, {
    ok: true,
    ...evaluation,
  });
}
