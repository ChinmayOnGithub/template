/*
 * logger.ts
 * Structured JSON logger with sensitive data redaction and correlation IDs.
 * Prevents credential and token leakage while preserving actionable debug context.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "cookie",
  "apikey",
  "api_key",
  "auth_secret",
  "creditcard",
  "credit_card",
  "cvv",
  "cvc",
]);

export function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;

  if (typeof data === "string") {
    // Redact bearer tokens
    if (/bearer\s+[a-zA-Z0-9._-]+/i.test(data)) {
      return data.replace(/bearer\s+[a-zA-Z0-9._-]+/gi, "Bearer [REDACTED]");
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey)) {
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
