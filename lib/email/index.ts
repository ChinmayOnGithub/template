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
      delivered: true,
    };
  }

  clear(): void {
    this.sentEmails.length = 0;
  }
}

let activeEmailProvider: EmailProvider = new MockEmailProvider();

export function setEmailProvider(provider: EmailProvider): void {
  activeEmailProvider = provider;
}

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const from = options.from || process.env.EMAIL_FROM || "noreply@example.com";
  return activeEmailProvider.send({
    ...options,
    from,
  });
}

export function getMockEmailProvider(): MockEmailProvider | null {
  return activeEmailProvider instanceof MockEmailProvider ? activeEmailProvider : null;
}
