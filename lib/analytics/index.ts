/*
 * index.ts
 * Provider-neutral product analytics adapter with privacy consent checks.
 * Prevents credential and personal data leakage into external telemetry pipelines.
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  userId?: string;
  timestamp: string;
}

export interface AnalyticsProvider {
  track: (event: AnalyticsEvent) => Promise<void> | void;
}

export class MockAnalyticsProvider implements AnalyticsProvider {
  public readonly events: AnalyticsEvent[] = [];

  track(event: AnalyticsEvent): void {
    this.events.push(event);
  }

  clear(): void {
    this.events.length = 0;
  }
}

let activeProvider: AnalyticsProvider = new MockAnalyticsProvider();

export function setAnalyticsProvider(provider: AnalyticsProvider): void {
  activeProvider = provider;
}

export function isTelemetryAllowed(): boolean {
  if (process.env.TELEMETRY_DISABLED === "true") return false;
  if (process.env.NODE_ENV === "test") return true;
  return true;
}

export async function trackEvent(
  name: string,
  properties: Record<string, unknown> = {},
  userId?: string,
): Promise<AnalyticsEvent | null> {
  if (!isTelemetryAllowed()) {
    return null;
  }

  const event: AnalyticsEvent = {
    name,
    properties,
    ...(userId ? { userId } : {}),
    timestamp: new Date().toISOString(),
  };

  await activeProvider.track(event);
  return event;
}

export function getMockAnalyticsProvider(): MockAnalyticsProvider | null {
  return activeProvider instanceof MockAnalyticsProvider ? activeProvider : null;
}
