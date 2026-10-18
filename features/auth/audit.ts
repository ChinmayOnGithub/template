/*
 * audit.ts
 * Security event and sensitive mutation audit logging utility.
 * Records authentication attempts, authorization failures, and administrative actions.
 */

import { db, isDatabaseConfigured } from "@/server/db";

export interface SecurityEvent {
  action: string;
  userId?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  timestamp?: number;
}

const auditLogBuffer: SecurityEvent[] = [];

export function logSecurityEvent(event: SecurityEvent): SecurityEvent {
  const recorded: SecurityEvent = {
    ...event,
    timestamp: event.timestamp ?? Date.now(),
  };

  auditLogBuffer.push(recorded);

  if (process.env.NODE_ENV !== "test") {
    console.warn(
      `[SECURITY AUDIT] Action: ${recorded.action} | User: ${recorded.userId || "anonymous"}`,
    );
  }

  // Persist to database asynchronously when database is configured
  if (isDatabaseConfigured()) {
    db.auditLog
      .create({
        data: {
          action: recorded.action,
          userId: recorded.userId || null,
          ipAddress: recorded.ipAddress || null,
          metadata: (recorded.metadata as unknown as object) || undefined,
          entity: "security_event",
        },
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== "test") {
          console.error(`[AUDIT PERSISTENCE ERROR] Failed to write audit record: ${err.message}`);
        }
      });
  }

  return recorded;
}

export async function logCriticalSecurityEvent(event: SecurityEvent): Promise<SecurityEvent> {
  const recorded = logSecurityEvent(event);
  if (isDatabaseConfigured()) {
    try {
      await db.auditLog.create({
        data: {
          action: recorded.action,
          userId: recorded.userId || null,
          ipAddress: recorded.ipAddress || null,
          metadata: (recorded.metadata as unknown as object) || undefined,
          entity: "security_critical",
        },
      });
    } catch (err: unknown) {
      const msg = `[CRITICAL AUDIT FAILURE] Failed to persist critical security audit log: ${err instanceof Error ? err.message : String(err)}`;
      console.error(msg);
      if (process.env.NODE_ENV === "production") {
        throw new Error(msg);
      }
    }
  } else if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[CRITICAL AUDIT FAILURE] Database persistence is required for critical security actions in production.",
    );
  }
  return recorded;
}

export function getAuditLogBuffer(): SecurityEvent[] {
  return [...auditLogBuffer];
}

export function clearAuditLogBuffer(): void {
  auditLogBuffer.length = 0;
}
