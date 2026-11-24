import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { getCurrentUser } from "../services/auth";

export type NormalizedRole = "admin" | "editor" | "user";

export interface BackendRole {
  id?: string;
  name?: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: NormalizedRole;
  role_id?: string;
  rawRole?: BackendRole | string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user?: unknown, rememberMe?: boolean) => void;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isValidStoredToken(value: string | null): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed !== "undefined" && trimmed !== "null";
}

export function normalizeRole(role: unknown, roleId?: unknown): NormalizedRole {
  const candidates: string[] = [];

  if (typeof role === "string") {
    candidates.push(role);
  } else if (role && typeof role === "object") {
    const roleObj = role as BackendRole;
    if (typeof roleObj.name === "string") candidates.push(roleObj.name);
    if (typeof roleObj.id === "string") candidates.push(roleObj.id);
  }

  if (typeof roleId === "string") {
    candidates.push(roleId);
  }

  for (const rawCandidate of candidates) {
    const value = rawCandidate.trim().toLowerCase();
    if (!value) continue;
    if (value === "admin" || value === "role-admin" || value.endsWith("-admin")) {
      return "admin";
    }
    if (value === "editor" || value === "role-editor" || value.endsWith("-editor")) {
      return "editor";
    }
    if (value === "user" || value === "role-user" || value.endsWith("-user")) {
      return "user";
    }
  }

  return "user";
}

export function extractAuthToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const nested =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : null;

  const rawToken =
    record.access_token ??
    record.token ??
    nested?.access_token ??
    nested?.token;

  if (typeof rawToken !== "string") return null;
  const cleaned = rawToken.trim();
  return isValidStoredToken(cleaned) ? cleaned : null;
}

export function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== "object") return null;
  const container = raw as Record<string, unknown>;

  let candidate: Record<string, unknown> = container;
  if (container.user && typeof container.user === "object") {
    candidate = container.user as Record<string, unknown>;
  } else if (
    container.data &&
    typeof container.data === "object" &&
    !("email" in container) &&
    !("id" in container)
  ) {
    const dataObj = container.data as Record<string, unknown>;
    candidate =
      dataObj.user && typeof dataObj.user === "object"
        ? (dataObj.user as Record<string, unknown>)
        : dataObj;
  }

  const rawId = candidate.id ?? candidate.sub ?? candidate.user_id;
  const rawEmail = candidate.email;
  const rawName = candidate.name ?? candidate.full_name ?? candidate.username;

  if (!rawId && !rawEmail && !rawName) {
    return null;
  }

  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  const fallbackName = email ? email.split("@")[0] : "Usuario";
  const name =
    typeof rawName === "string" && rawName.trim().length > 0
      ? rawName.trim()
      : fallbackName;

  const roleId =
    typeof candidate.role_id === "string" ? candidate.role_id.trim() : undefined;
  const rawRole =
    typeof candidate.role === "string" || (candidate.role && typeof candidate.role === "object")
      ? (candidate.role as BackendRole | string)
      : undefined;

  return {
    id: rawId !== undefined && rawId !== null ? String(rawId) : undefined,
    name,
    email,
    role: normalizeRole(candidate.role, roleId),
    role_id: roleId,
    rawRole,
  };
}

function decodeJwtUserFallback(jwt: string): User | null {
  const parts = jwt.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const payload = JSON.parse(json);
    return normalizeUser(payload);
  } catch {
    return null;
  }
}

function readStoredAuth(): {
  token: string | null;
  user: User | null;
  rememberMe: boolean;
} {
  const localToken = localStorage.getItem("token");
  const sessionToken = sessionStorage.getItem("token");

  const useLocal = isValidStoredToken(localToken);
  const storedToken = useLocal
    ? localToken.trim()
    : isValidStoredToken(sessionToken)
    ? sessionToken.trim()
    : null;

  if (!storedToken) {
    return { token: null, user: null, rememberMe: true };
  }

  const rawUserStr = useLocal
    ? localStorage.getItem("user") || sessionStorage.getItem("user")
    : sessionStorage.getItem("user") || localStorage.getItem("user");

  let parsedUser: User | null = null;
  if (rawUserStr && rawUserStr !== "undefined" && rawUserStr !== "null") {
    try {
      parsedUser = normalizeUser(JSON.parse(rawUserStr));
    } catch {
      parsedUser = null;
    }
  }

  if (!parsedUser) {
    parsedUser = decodeJwtUserFallback(storedToken);
  }

  return { token: storedToken, user: parsedUser, rememberMe: useLocal };
}

function persistAuth(token: string, user: User | null, rememberMe: boolean): void {
  const target = rememberMe ? localStorage : sessionStorage;
  const opposite = rememberMe ? sessionStorage : localStorage;

  opposite.removeItem("token");
  opposite.removeItem("user");

  target.setItem("token", token);
  if (user) {
    target.setItem("user", JSON.stringify(user));
  } else {
    target.removeItem("user");
  }
}

function clearStoredAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    clearStoredAuth();
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const activeToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!isValidStoredToken(activeToken)) {
      return null;
    }

    const rememberMe = isValidStoredToken(localStorage.getItem("token"));
    const meResponse = await getCurrentUser();
    const normalized = normalizeUser(meResponse);

    if (normalized) {
      setUser(normalized);
      persistAuth(activeToken.trim(), normalized, rememberMe);
    }

    return normalized;
  }, []);

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      const { token: storedToken, user: storedUser, rememberMe } = readStoredAuth();

      if (!storedToken) {
        clearStoredAuth();
        if (active) setIsLoading(false);
        return;
      }

      if (active) {
        setToken(storedToken);
        if (storedUser) {
          setUser(storedUser);
          persistAuth(storedToken, storedUser, rememberMe);
          setIsLoading(false);
        }
      }

      try {
        const meResponse = await getCurrentUser();
        if (!active) return;

        const normalized = normalizeUser(meResponse);
        if (normalized) {
          setUser(normalized);
          persistAuth(storedToken, normalized, rememberMe);
        }
      } catch (error: any) {
        if (!active) return;
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          logout();
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      active = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  const login = useCallback(
    (newToken: string, rawUser?: unknown, rememberMe = true) => {
      const cleanedToken = typeof newToken === "string" ? newToken.trim() : "";
      if (!isValidStoredToken(cleanedToken)) {
        throw new Error("El servidor no devolvió un token de acceso válido.");
      }

      const normalizedUser =
        normalizeUser(rawUser) ?? decodeJwtUserFallback(cleanedToken);

      persistAuth(cleanedToken, normalizedUser, rememberMe);
      setToken(cleanedToken);
      setUser(normalizedUser);
      setIsLoading(false);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}