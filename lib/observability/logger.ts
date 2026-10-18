/*
 * logger.ts
 * Structured JSON logger with sensitive data redaction and correlation IDs.
 * Prevents credential, token, and database URL leakage while preserving debug context.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "clientsecret",
  "client_secret",
  "refreshtoken",
  "refresh_token",
  "accesstoken",
  "access_token",
  "privatekey",
  "private_key",
  "signingsecret",
  "signing_secret",
  "authorization",
  "cookie",
  "apikey",
  "api_key",
  "auth_secret",
  "database_url",
  "databaseurl",
  "creditcard",
  "credit_card",
  "cvv",
  "cvc",
]);

export function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    let sanitized = data;
    // Redact bearer tokens
    if (/bearer\s+[a-zA-Z0-9._-]+/i.test(sanitized)) {
      sanitized = sanitized.replace(/bearer\s+[a-zA-Z0-9._-]+/gi, "Bearer [REDACTED]");
    }
    // Redact postgresql connection URLs with embedded passwords
    if (/postgres(?:ql)?:\/\/[^:]+:[^@]+@/i.test(sanitized)) {
      sanitized = sanitized.replace(
        /postgres(?:ql)?:\/\/([^:]+):([^@]+)@/gi,
        "postgresql://$1:[REDACTED]@",
      );
    }
    // Redact URL query parameter tokens
    if (/([?&](?:token|secret|key|password|apiKey)=)[^&]+/i.test(sanitized)) {
      sanitized = sanitized.replace(
        /([?&](?:token|secret|key|password|apiKey)=)[^&]+/gi,
        "$1[REDACTED]",
      );
    }
    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase().replace(/[-_]/g, "");
      if (SENSITIVE_KEYS.has(lowerKey) || SENSITIVE_KEYS.has(key.toLowerCase())) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = redactSensitiveData(value);
      }
    }
    return sanitized;
  }

  return data;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  requestId?: string;
  timestamp: string;
  context?: unknown;
}

export class Logger {
  private log(level: LogLevel, message: string, context?: unknown, requestId?: string): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(requestId ? { requestId } : {}),
      ...(context !== undefined ? { context: redactSensitiveData(context) } : {}),
    };

    if (process.env.NODE_ENV !== "test") {
      const output = JSON.stringify(entry);
      if (level === "error") {
        console.error(output);
      } else if (level === "warn") {
        console.warn(output);
      } else {
        process.stdout.write(output + "\n");
      }
    }

    return entry;
  }

  debug(message: string, context?: unknown, requestId?: string): LogEntry {
    return this.log("debug", message, context, requestId);
  }

  info(message: string, context?: unknown, requestId?: string): LogEntry {
    return this.log("info", message, context, requestId);
  }

  warn(message: string, context?: unknown, requestId?: string): LogEntry {
    return this.log("warn", message, context, requestId);
  }

  error(message: string, context?: unknown, requestId?: string): LogEntry {
    return this.log("error", message, context, requestId);
  }
}

export const logger = new Logger();
