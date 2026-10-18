/*
 * index.ts
 * Cookie and tracking consent state management and storage layer.
 * Enforces privacy boundaries by gating non-essential analytics and marketing scripts.
 */

export const CONSENT_STORAGE_KEY = "saas_cookie_consent_v1";
export const CURRENT_CONSENT_VERSION = 1;

export interface ConsentPreferences {
  version: number;
  necessary: true; // Strictly necessary cookies are always required
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

export const defaultConsentPreferences: ConsentPreferences = {
  version: CURRENT_CONSENT_VERSION,
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: new Date().toISOString(),
};

export function getStoredConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    if (parsed.version !== CURRENT_CONSENT_VERSION) {
      return null;
    }

    return {
      version: CURRENT_CONSENT_VERSION,
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveConsent(preferences: {
  analytics: boolean;
  marketing: boolean;
}): ConsentPreferences {
  const finalPrefs: ConsentPreferences = {
    version: CURRENT_CONSENT_VERSION,
    necessary: true,
    analytics: preferences.analytics,
    marketing: preferences.marketing,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(finalPrefs));
      window.dispatchEvent(new CustomEvent("cookie_consent_updated", { detail: finalPrefs }));
    } catch {
      // Storage unavailable or disabled
    }
  }

  return finalPrefs;
}

export function hasUserConsented(category: "analytics" | "marketing"): boolean {
  const current = getStoredConsent();
  if (!current) return false;
  return current[category] === true;
}
