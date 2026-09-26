---
name: security-review
description: Audit auth flows, user data isolation, input sanitization, file uploads, payments, and secret handling.
---

# Security Review Skill

Trigger this skill whenever writing or modifying code involving:
- Authentication & Sessions
- Authorization & Permissions
- Database queries with tenant/user boundaries
- File uploads and MIME-type handling
- External API integrations or webhooks
- Payment gateways or sensitive configuration

## 1. Security Checklist
- [ ] **Tenant Isolation**: Does every query explicitly filter by `session.userId`?
- [ ] **Input Validation**: Are all request payloads validated with Zod/schema parsers?
- [ ] **Sanitization**: Is user-supplied markup escaped to prevent Cross-Site Scripting (XSS)?
- [ ] **CSRF & Cookies**: Are cookies flagged `HttpOnly`, `Secure`, and `SameSite=Lax` or `Strict`?
- [ ] **No Secret Exposure**: Are keys, tokens, and credentials strictly loaded from environment variables?
