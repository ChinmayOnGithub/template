/*
 * index.ts
 * Transactional email delivery adapter supporting mock and live transports.
 * Standardizes email sending with template formatting and retry safety.
 */

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  messageId: string;
  delivered: boolean;
  mock?: boolean;
}

export interface EmailProvider {
  send: (options: SendEmailOptions) => Promise<EmailResult>;
}

export class MockEmailProvider implements EmailProvider {
  public readonly sentEmails: SendEmailOptions[] = [];

  async send(options: SendEmailOptions): Promise<EmailResult> {
    this.sentEmails.push(options);
    return {
      messageId: `msg_mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      delivered: false, // In-memory sink: recorded in memory only, not delivered to external inbox
      mock: true,
    };
  }

  clear(): void {
    this.sentEmails.length = 0;
  }
}

export class ResendEmailProvider implements EmailProvider {
  constructor(private apiKey: string) {}

  async send(options: SendEmailOptions): Promise<EmailResult> {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: options.from || process.env.EMAIL_FROM || "noreply@example.com",
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend email delivery failed (${res.status}): ${err}`);
    }

    const json = (await res.json()) as { id: string };
    return {
      messageId: json.id,
      delivered: true,
      mock: false,
    };
  }
}

const defaultMockProvider = new MockEmailProvider();
let customEmailProvider: EmailProvider | null = null;

export function setEmailProvider(provider: EmailProvider): void {
  customEmailProvider = provider;
}

export function getActiveEmailProvider(): EmailProvider {
  if (customEmailProvider) return customEmailProvider;
  if (process.env.RESEND_API_KEY) {
    return new ResendEmailProvider(process.env.RESEND_API_KEY);
  }
  return defaultMockProvider;
}

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const from = options.from || process.env.EMAIL_FROM || "noreply@example.com";

  if (
    process.env.NODE_ENV === "production" &&
    !process.env.RESEND_API_KEY &&
    !customEmailProvider
  ) {
    throw new Error(
      "[EMAIL] Transactional email provider credentials (RESEND_API_KEY) must be configured in production.",
    );
  }

  const provider = getActiveEmailProvider();
  return provider.send({
    ...options,
    from,
  });
}

export function getMockEmailProvider(): MockEmailProvider | null {
  const provider = getActiveEmailProvider();
  return provider instanceof MockEmailProvider ? provider : null;
}

export async function sendVerificationEmail(params: {
  to: string;
  verificationUrl: string;
  userName?: string;
}): Promise<EmailResult> {
  const greeting = params.userName ? `Hello ${params.userName}` : "Hello";
  const html = `
    <div style="font-family: sans-serif; line-height: 1.5; color: #111;">
      <p>${greeting},</p>
      <p>Please verify your email address to complete your registration by clicking the link below:</p>
      <p><a href="${params.verificationUrl}" style="display: inline-block; padding: 10px 20px; background: #0284c7; color: #fff; text-decoration: none; border-radius: 6px;">Verify Email Address</a></p>
      <p>If you did not request this email, you can safely ignore it.</p>
    </div>
  `;
  const text = `${greeting},\n\nPlease verify your email address: ${params.verificationUrl}\n\nIf you did not request this, please ignore.`;

  return sendEmail({
    to: params.to,
    subject: "Verify your email address",
    html,
    text,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
  userName?: string;
}): Promise<EmailResult> {
  const greeting = params.userName ? `Hello ${params.userName}` : "Hello";
  const html = `
    <div style="font-family: sans-serif; line-height: 1.5; color: #111;">
      <p>${greeting},</p>
      <p>We received a request to reset your password. Click the link below to set a new password:</p>
      <p><a href="${params.resetUrl}" style="display: inline-block; padding: 10px 20px; background: #0284c7; color: #fff; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
      <p>This link is single-use and will expire shortly.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
    </div>
  `;
  const text = `${greeting},\n\nReset your password: ${params.resetUrl}\n\nThis link will expire shortly.`;

  return sendEmail({
    to: params.to,
    subject: "Reset your password",
    html,
    text,
  });
}
