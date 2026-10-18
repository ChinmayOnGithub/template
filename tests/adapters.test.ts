/*
 * adapters.test.ts
 * Unit tests for analytics, object storage, and transactional email adapters.
 * Asserts telemetry dispatching, upload constraints, and email delivery.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { trackEvent, getMockAnalyticsProvider } from "../lib/analytics";
import { storage } from "../lib/storage";
import { sendEmail, getMockEmailProvider } from "../lib/email";
import { BadRequestError } from "../lib/api/errors";

describe("Analytics Adapter", () => {
  beforeEach(() => {
    getMockAnalyticsProvider()?.clear();
  });

  it("records analytics event with properties and timestamp", async () => {
    const event = await trackEvent("project.created", { projectId: "prj_123" }, "usr_1");
    expect(event?.name).toBe("project.created");
    expect(event?.userId).toBe("usr_1");
    expect(event?.properties).toEqual({ projectId: "prj_123" });

    const mock = getMockAnalyticsProvider();
    expect(mock?.events.length).toBe(1);
  });
});

describe("Object Storage Adapter", () => {
  it("generates presigned upload URL for valid file within limits", async () => {
    const result = await storage.getPresignedUploadUrl(
      "uploads/avatar.png",
      "image/png",
      1024 * 50,
    );
    expect(result.uploadUrl).toContain("https://storage.mock.local/upload/uploads/avatar.png");
    expect(result.fileKey).toBe("uploads/avatar.png");
    expect(result.expiresInSeconds).toBe(900);
  });

  it("rejects files exceeding maximum size limit", async () => {
    await expect(
      storage.getPresignedUploadUrl("huge-file.mp4", "video/mp4", 1024 * 1024 * 100, {
        maxSizeBytes: 1024 * 1024 * 10, // 10MB limit
      }),
    ).rejects.toThrow(BadRequestError);
  });

  it("rejects disallowed MIME types", async () => {
    await expect(
      storage.getPresignedUploadUrl("script.exe", "application/x-msdownload", 1024),
    ).rejects.toThrow(BadRequestError);
  });
});

describe("Email Delivery Adapter", () => {
  beforeEach(() => {
    getMockEmailProvider()?.clear();
  });

  it("dispatches transactional email via mock transport", async () => {
    const result = await sendEmail({
      to: "customer@example.com",
      subject: "Welcome to our platform",
      html: "<p>Welcome!</p>",
    });

    expect(result.delivered).toBe(true);
    expect(result.messageId).toBeDefined();

    const mock = getMockEmailProvider();
    expect(mock).not.toBeNull();
    const sent = mock?.sentEmails[0];
    expect(sent).toBeDefined();
    expect(sent?.to).toBe("customer@example.com");
    expect(sent?.subject).toBe("Welcome to our platform");
  });
});
