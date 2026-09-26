# Security Baseline

## 1. Zero Trust Input Validation
- Validate all incoming request arguments, CLI flags, and external payloads using strict schemas before processing.
- Reject unexpected fields. Parameterize and sanitize outputs to prevent injection attacks (SQLi, XSS, Command Injection).

## 2. Authorization and Tenant Scoping (Where Applicable)
- In multi-tenant systems, every database read, update, and delete query must explicitly assert authenticated user or organization context (`userId` / `orgId`).
- Never trust resource IDs provided by client bodies without asserting session ownership.

## 3. Secret Protection
- Never output API keys, private keys, JWT secrets, credentials, or connection strings in logs, code, or client bundles.
- Always load credentials strictly from environment variables or secure key vaults.
- Maintain `.env.example` with clear documentation for every variable. Never commit `.env` or `.env.local`.

## 4. Web Application Security Reference (OWASP ASVS)
When developing web applications, reference OWASP ASVS:
- Authentication: Secure password hashing (Argon2id/bcrypt), brute force protection, secure session lifecycles.
- Session Management: Store tokens in `HttpOnly`, `Secure`, `SameSite=Lax` or `Strict` cookies.
- Access Control: Centralized authorization checks on all protected endpoints.
- Error Handling: Do not expose raw database stack traces or internal infrastructure details to clients.
