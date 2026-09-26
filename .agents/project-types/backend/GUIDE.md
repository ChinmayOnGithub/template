# Backend Project Standards

## 1. Overview
Applies to standalone API servers, microservices, background job workers, and cloud services.

## 2. Core Architectural Constraints
- Layered Architecture: Request Controller -> Business Logic Service -> Data Repository.
- Idempotency: All mutating endpoints must accept an idempotency key where network retries are possible.
- Structured Logging: Emit JSON logs with correlation IDs (`traceId`, `userId`) without exposing sensitive PII or credentials.
- Graceful Shutdown: Handle `SIGTERM` and `SIGINT` to complete in-flight transactions before terminating process.

## 3. Sub-Platform References
- See `node/GUIDE.md` for Node.js, Fastify/Express, and Prisma/Drizzle standards.
- See `spring-boot/GUIDE.md` for Java/Spring Boot enterprise conventions.
