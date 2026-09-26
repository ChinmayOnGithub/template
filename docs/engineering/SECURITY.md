# Security Baseline (SECURITY.md)

This document establishes the security standards and verification criteria across system architectures.

---

## 1. Universal Security Principles

These principles apply to all software projects regardless of language or framework:

1. **Least Privilege**:
   Processes, database users, API tokens, and platform permissions must operate with the minimum privileges required to perform their function.
2. **Never Trust External Input**:
   Validate all data crossing trust boundaries (user input, external API responses, file uploads, CLI arguments, environment variables) against strict schemas before processing.
3. **Secret Protection**:
   Never commit private keys, API tokens, database connection strings, passwords, or encryption secrets to version control. Always load secrets from environment variables or secure key vaults. Maintain `.env.example` with sanitized placeholders.
4. **Fail Securely**:
   When an operation or authentication check fails, the system must default to rejecting access rather than allowing permissive bypass.
5. **No Dangerous Output Injections**:
   Sanitize and parameterize all outputs to prevent SQL injection, Command Injection, Cross-Site Scripting (XSS), or template injection.

---

## 2. Project-Type Security Standards

### A. Multi-Tenant Web & SaaS Applications
- **Tenant Isolation**: In multi-tenant applications, every database read, update, and delete query must explicitly verify user or organization ownership (`WHERE userId = session.userId`). Never trust IDs passed in request bodies without validating session ownership.
- **Session & Cookie Security**: Store session tokens in `HttpOnly`, `Secure`, `SameSite=Lax` or `Strict` cookies.
- **CSRF & CORS**: Reject untrusted origins on mutating requests. Validate anti-CSRF tokens or use SameSite cookie defenses.
- **OWASP ASVS Alignment**: Reference the OWASP Application Security Verification Standard (ASVS) Level 2 for commercial web applications.

### B. Browser Extensions
- **Manifest V3 Content Security Policy (CSP)**: Prohibit remote script execution and `eval()`.
- **Minimal Permissions**: Request only strictly necessary permissions (avoid broad `<all_urls>` or `*://*/*` host permissions).
- **Secure Message Passing**: Validate message origin and sender before handling background tasks.

### C. Backend APIs & Microservices
- **Rate Limiting**: Enforce IP and token-based rate limiting on all public authentication and mutation endpoints.
- **Payload Limits**: Enforce maximum request payload size at the edge to mitigate denial-of-service attempts.

### D. Native Systems & CLI Utilities
- **Memory Safety**: Enforce bounds checking and RAII lifecycle to prevent buffer overflows, use-after-free, and memory corruption.
- **Safe Process Execution**: Never pass unescaped user inputs directly to shell execution functions (`system()`, `popen()`, `exec()`). Always pass arguments as discrete arrays.
