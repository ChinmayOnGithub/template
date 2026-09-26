# Security Review Prompt

Use this prompt when auditing sensitive modules, auth flows, or data persistence.

## Task
Audit code against OWASP ASVS standards and security baseline rules.

## Verification Checklist
1. **Authentication and Session**:
   - Token lifecycle, cookie security flags (`HttpOnly`, `Secure`, `SameSite`).
2. **Authorization and Scoping**:
   - User ownership asserted on all database reads, updates, and deletes.
3. **Input Validation and Injection Defense**:
   - Schema parsing (Zod) on all inputs; parameterized database queries.
4. **Secret Management**:
   - Zero hardcoded keys or credentials; verified `.env.example` completeness.
