import type { IncomingMessage, ServerResponse } from "node:http";

export interface ApiRequest extends IncomingMessage {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
  ip?: string;
}

export interface ApiResponse extends ServerResponse {
  status?: (code: number) => ApiResponse;
  json?: (body: unknown) => ApiResponse | void;
  send?: (body: unknown) => ApiResponse | void;
}

export interface RateLimitOptions {
  scope: string;
  maxRequests: number;
  windowMs: number;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();
const MAX_BUCKETS = 5000;

function getHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string | undefined {
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return typeof value === "string" ? value : undefined;
}

export function sendJson(
  res: ApiResponse,
  statusCode: number,
  payload: unknown
): void {
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(statusCode).json(payload);
    return;
  }

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function sendError(
  res: ApiResponse,
  statusCode: number,
  code: string,
  message: string,
  extra?: Record<string, unknown>
): void {
  sendJson(res, statusCode, {
    ok: false,
    error: {
      code,
      message,
      ...(extra ?? {}),
    },
  });
}

function getAllowedOriginsFromEnv(): string[] {
  const raw = process.env.ALLOWED_ORIGINS || "";
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin: string, req: ApiRequest): boolean {
  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    return false;
  }

  const forwardedHost = getHeader(req.headers, "x-forwarded-host");
  const host = forwardedHost || getHeader(req.headers, "host");

  if (host && parsedOrigin.host.toLowerCase() === host.toLowerCase()) {
    return true;
  }

  const envOrigins = getAllowedOriginsFromEnv();
  if (envOrigins.includes(origin)) {
    return true;
  }

  if (process.env.NODE_ENV !== "production") {
    const hostname = parsedOrigin.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }
  }

  return false;
}

export function applyCors(req: ApiRequest, res: ApiResponse): boolean {
  const origin = getHeader(req.headers, "origin");

  res.setHeader("Vary", "Origin");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (origin) {
    if (!isOriginAllowed(origin, req)) {
      sendError(res, 403, "CORS_FORBIDDEN", "Origen no autorizado para esta solicitud.");
      return false;
    }
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Session-Id"
  );

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return false;
  }

  return true;
}

function pruneExpiredBuckets(now: number): void {
  if (rateLimitStore.size < MAX_BUCKETS) return;
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function getClientIdentifier(req: ApiRequest): string {
  const forwardedFor = getHeader(req.headers, "x-forwarded-for");
  const realIp = getHeader(req.headers, "x-real-ip");
  const rawIp =
    (forwardedFor ? forwardedFor.split(",")[0]?.trim() : undefined) ||
    realIp ||
    req.ip ||
    req.socket?.remoteAddress ||
    "unknown";

  const rawSession = getHeader(req.headers, "x-session-id") || "";
  const safeSession = rawSession.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48);

  return safeSession ? `${rawIp}:${safeSession}` : rawIp;
}

export function checkRateLimit(
  req: ApiRequest,
  res: ApiResponse,
  options: RateLimitOptions
): boolean {
  const now = Date.now();
  pruneExpiredBuckets(now);

  const clientId = getClientIdentifier(req);
  const key = `${options.scope}:${clientId}`;

  let bucket = rateLimitStore.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = {
      count: 0,
      resetAt: now + options.windowMs,
    };
  }

  bucket.count += 1;
  rateLimitStore.set(key, bucket);

  const remaining = Math.max(0, options.maxRequests - bucket.count);
  const resetSeconds = Math.ceil((bucket.resetAt - now) / 1000);

  res.setHeader("X-RateLimit-Limit", String(options.maxRequests));
  res.setHeader("X-RateLimit-Remaining", String(remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

  if (bucket.count > options.maxRequests) {
    res.setHeader("Retry-After", String(Math.max(1, resetSeconds)));
    sendError(
      res,
      429,
      "RATE_LIMIT_EXCEEDED",
      "Has realizado demasiadas solicitudes seguidas. Por favor espera unos segundos antes de volver a intentarlo.",
      { retryAfterSeconds: Math.max(1, resetSeconds) }
    );
    return false;
  }

  return true;
}

export async function parseJsonBody<T = Record<string, unknown>>(
  req: ApiRequest
): Promise<T> {
  if (req.body !== undefined) {
    if (typeof req.body === "string") {
      return JSON.parse(req.body) as T;
    }
    if (typeof req.body === "object" && req.body !== null) {
      return req.body as T;
    }
    throw new Error("Cuerpo de solicitud inválido.");
  }

  const chunks: Buffer[] = [];
  let totalBytes = 0;
  const maxBytes = 256 * 1024;

  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buf.length;
    if (totalBytes > maxBytes) {
      throw new Error("El cuerpo de la solicitud excede el tamaño máximo permitido.");
    }
    chunks.push(buf);
  }

  if (chunks.length === 0) {
    return {} as T;
  }

  const raw = Buffer.concat(chunks).toString("utf-8").trim();
  if (!raw) return {} as T;
  return JSON.parse(raw) as T;
}
