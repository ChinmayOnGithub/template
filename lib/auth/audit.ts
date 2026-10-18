/*
 * audit.ts
 * Security event and sensitive mutation audit logging utility.
 * Records authentication attempts, authorization failures, and administrative actions.
 */

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

  return recorded;
}

export function getAuditLogBuffer(): SecurityEvent[] {
  return [...auditLogBuffer];
}

export function clearAuditLogBuffer(): void {
  auditLogBuffer.length = 0;
}
